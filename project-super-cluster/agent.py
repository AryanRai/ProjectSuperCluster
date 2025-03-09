import os
import time
import subprocess
from supabase import create_client, Client

# Initialize Supabase client
supabase_url = "https://akyzhmdbbrqkzghwibov.supabase.co"
supabase_key = "your-anon-key"  # Replace with your anon key
supabase: Client = create_client(supabase_url, supabase_key)

def execute_command(command: str) -> tuple[int, str, str]:
    """Execute a shell command and return exit code, stdout, and stderr."""
    try:
        process = subprocess.Popen(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = process.communicate()
        return process.returncode, stdout, stderr
    except Exception as e:
        return 1, "", str(e)

def process_commands():
    """Process pending commands from the server_commands table."""
    try:
        # Get pending commands
        response = supabase.table("server_commands") \
            .select("*") \
            .eq("status", "pending") \
            .execute()
        
        for command in response.data:
            # Update status to processing
            supabase.table("server_commands") \
                .update({"status": "processing"}) \
                .eq("id", command["id"]) \
                .execute()
            
            # Execute command
            exit_code, stdout, stderr = execute_command(command["command"])
            
            # Update command status and result
            status = "completed" if exit_code == 0 else "failed"
            result = f"Exit code: {exit_code}\nStdout: {stdout}\nStderr: {stderr}"
            
            supabase.table("server_commands") \
                .update({
                    "status": status,
                    "result": result
                }) \
                .eq("id", command["id"]) \
                .execute()
            
    except Exception as e:
        print(f"Error processing commands: {e}")

def main():
    """Main loop to continuously check for and process commands."""
    print("Starting Minecraft server agent...")
    while True:
        process_commands()
        time.sleep(5)  # Wait 5 seconds before checking again

if __name__ == "__main__":
    main() 