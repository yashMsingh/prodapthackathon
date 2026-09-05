import os
import json
import base64
from bs4 import BeautifulSoup
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

def get_gmail_service():
    """Builds and returns the Gmail service using the token.json."""
    if not os.path.exists("token.json"):
        print("ERROR: token.json not found. Please run gmail_auth.py first.")
        return None
        
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        
    return build("gmail", "v1", credentials=creds)

def clean_html(html_content):
    """Strips HTML tags and returns plain text."""
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, "html.parser")
    # A simple cleaning: just get text and remove excessive newlines
    text = soup.get_text(separator="\n")
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return "\n".join(lines)

def fetch_latest_threads(service, max_results=5):
    """Fetches the latest threads and cleans them for LLM processing."""
    print(f"Fetching {max_results} recent threads...")
    
    # You can change 'q' to filter by unread, specific senders, etc. Example: q="is:unread"
    results = service.users().threads().list(userId="me", maxResults=max_results, q="").execute()
    threads = results.get("threads", [])
    
    if not threads:
        print("No threads found.")
        return []
        
    llm_payloads = []
    
    for t in threads:
        thread_id = t["id"]
        # Fetch the full thread
        thread_data = service.users().threads().get(userId="me", id=thread_id).execute()
        
        messages = thread_data.get("messages", [])
        
        conversation_history = []
        subject = "No Subject"
        
        for msg in messages:
            headers = msg.get("payload", {}).get("headers", [])
            sender = next((h["value"] for h in headers if h["name"].lower() == "from"), "Unknown")
            date = next((h["value"] for h in headers if h["name"].lower() == "date"), "Unknown")
            
            # Get subject from the first message in the thread
            if subject == "No Subject":
                subject = next((h["value"] for h in headers if h["name"].lower() == "subject"), "No Subject")
            
            # Extract body
            body = ""
            parts = msg.get("payload", {}).get("parts", [])
            
            # If it's a simple message without parts
            if not parts and "body" in msg.get("payload", {}):
                data = msg["payload"]["body"].get("data")
                if data:
                    body = base64.urlsafe_b64decode(data).decode("utf-8")
                    
            # If it's a multipart message
            for part in parts:
                if part.get("mimeType") == "text/plain":
                    data = part.get("body", {}).get("data")
                    if data:
                        body = base64.urlsafe_b64decode(data).decode("utf-8")
                        break
                elif part.get("mimeType") == "text/html":
                    data = part.get("body", {}).get("data")
                    if data:
                        raw_html = base64.urlsafe_b64decode(data).decode("utf-8")
                        body = clean_html(raw_html)
                        
            # Clean up the body text
            clean_body = body.strip() if body else "[No Content]"
            
            conversation_history.append({
                "sender": sender,
                "timestamp": date,
                "body": clean_body
            })
            
        # Collect participants from messages
        participants = []
        seen_emails = set()
        for msg_info in conversation_history:
            sender_str = msg_info["sender"]
            if sender_str not in seen_emails:
                seen_emails.add(sender_str)
                # Ideally split name and email, but this works for the schema
                participants.append({"name": sender_str.split("<")[0].strip(), "email": sender_str})
                
        payload = {
            "thread_id": thread_id,
            "subject": subject,
            "participants": participants,
            "messages": conversation_history
        }
        
        llm_payloads.append(payload)
        
    return llm_payloads

if __name__ == "__main__":
    service = get_gmail_service()
    if service:
        # Fetch and format
        data_for_llm = fetch_latest_threads(service, max_results=2)
        
        # Save to JSON file so your LLM teammate can pick it up
        output_file = "llm_input_payload.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data_for_llm, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully fetched and cleaned {len(data_for_llm)} threads.")
        print(f"Payload saved to {output_file} for the LLM pipeline!")
