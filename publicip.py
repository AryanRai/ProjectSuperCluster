import requests

def get_public_ip():
    try:
        # Fetch public IP from a reliable API
        response = requests.get('https://api.ipify.org')
        if response.status_code == 200:
            public_ip = response.text
            print(f"Your public IP address is: {public_ip}")
        else:
            print("Failed to retrieve IP. Status code:", response.status_code)
    except requests.RequestException as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    get_public_ip()