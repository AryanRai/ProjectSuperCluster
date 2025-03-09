import os
import time
import subprocess
import logging
from supabase import create_client, Client

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Initialize Supabase client
supabase_url = "https://akyzhmdbbrqkzghwibov.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFreXpobWRiYnJxa3pnaHdpYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzUxMzksImV4cCI6MjA1NzA1MTEzOX0.2WiX2RLgdNwFaX99MpPViBGNy-DCTXr-iWXrYzItrXs"

try:
    supabase: Client = create_client(supabase_url, supabase_key)
    logging.info("Successfully connected to Supabase")
except Exception as e:
    logging.error(f"Failed to connect to Supabase: {e}")
    raise

def execute_command(command: str) -> tuple[int, str, str]:
    """Execute a shell command and return exit code, stdout, and stderr."""
    try:
        logging.info(f"Executing command: {command}")
        process = subprocess.Popen(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = process.communicate()
        logging.info(f"Command completed with exit code: {process.returncode}")
        if stdout:
            logging.info(f"Command output: {stdout}")
        if stderr:
            logging.warning(f"Command error output: {stderr}")
        return process.returncode, stdout, stderr
    except Exception as e:
        logging.error(f"Error executing command: {e}")
        return 1, "", str(e)

def process_commands():
    """Process pending commands from the server_commands table."""
    try:
        # Get pending commands
        logging.info("Checking for pending commands...")
        response = supabase.table("server_commands") \
            .select("*") \
            .eq("status", "pending") \
            .execute()
        
        if not response.data:
            logging.debug("No pending commands found")
            return

        logging.info(f"Found {len(response.data)} pending commands")
        
        for command in response.data:
            logging.info(f"Processing command ID: {command['id']}")
            
            # Update status to processing
            try:
                supabase.table("server_commands") \
                    .update({"status": "processing"}) \
                    .eq("id", command["id"]) \
                    .execute()
                logging.info("Updated status to processing")
            except Exception as e:
                logging.error(f"Error updating status to processing: {e}")
                continue
            
            # Execute command
            exit_code, stdout, stderr = execute_command(command["command"])
            
            # Update command status and result
            status = "completed" if exit_code == 0 else "failed"
            result = f"Exit code: {exit_code}\nStdout: {stdout}\nStderr: {stderr}"
            
            try:
                supabase.table("server_commands") \
                    .update({
                        "status": status,
                        "result": result
                    }) \
                    .eq("id", command["id"]) \
                    .execute()
                logging.info(f"Command completed with status: {status}")
            except Exception as e:
                logging.error(f"Error updating command result: {e}")
            
    except Exception as e:
        logging.error(f"Error processing commands: {e}")

def main():
    """Main loop to continuously check for and process commands."""
    logging.info("Starting Minecraft server agent...")
    logging.info(f"Connected to Supabase URL: {supabase_url}")
    
    while True:
        try:
            process_commands()
        except Exception as e:
            logging.error(f"Error in main loop: {e}")
        time.sleep(5)  # Wait 5 seconds before checking again

if __name__ == "__main__":
    main() 