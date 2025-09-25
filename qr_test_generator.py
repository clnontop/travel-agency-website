#!/usr/bin/env python3
"""
QR Code Generator for Trink Driver App Testing
Generates QR codes that match the expected format for the mobile app
"""

import json
import qrcode
from PIL import Image
import os

def generate_job_qr(job_id, action):
    """Generate a job-related QR code"""
    qr_data = {
        "type": "job_qr",
        "jobId": job_id,
        "action": action,
        "customerName": "Test Customer",
        "phone": "+91 9876543210",
        "pickup": "Delhi, India",
        "delivery": "Mumbai, India",
        "timestamp": 1694598000000  # Fixed timestamp for testing
    }
    
    return json.dumps(qr_data)

def generate_location_qr(location_name, lat, lng):
    """Generate a location check-in QR code"""
    qr_data = {
        "type": "location_qr",
        "location": location_name,
        "lat": lat,
        "lng": lng,
        "timestamp": 1694598000000
    }
    
    return json.dumps(qr_data)

def generate_customer_qr(customer_id, name, phone):
    """Generate a customer verification QR code"""
    qr_data = {
        "type": "customer_verification",
        "customerId": customer_id,
        "customerName": name,
        "phone": phone,
        "timestamp": 1694598000000
    }
    
    return json.dumps(qr_data)

def create_qr_image(data, filename):
    """Create QR code image from data"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filename)
    print(f"✅ Generated: {filename}")
    return filename

def main():
    print("🚛 Trink Driver QR Code Generator")
    print("=" * 40)
    
    # Create output directory
    output_dir = "qr_codes"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate different types of QR codes
    test_cases = [
        {
            "name": "Pickup Complete",
            "data": generate_job_qr("TRK001", "pickup_complete"),
            "filename": f"{output_dir}/pickup_qr.png"
        },
        {
            "name": "Delivery Complete", 
            "data": generate_job_qr("TRK002", "delivery_complete"),
            "filename": f"{output_dir}/delivery_qr.png"
        },
        {
            "name": "Location Check-in",
            "data": generate_location_qr("Delhi Warehouse", 28.6139, 77.2090),
            "filename": f"{output_dir}/location_qr.png"
        },
        {
            "name": "Customer Verification",
            "data": generate_customer_qr("CUST001", "John Doe", "+91 9876543210"),
            "filename": f"{output_dir}/customer_qr.png"
        }
    ]
    
    # Generate all QR codes
    for test_case in test_cases:
        print(f"\n📦 Generating {test_case['name']}...")
        print(f"Data: {test_case['data'][:100]}...")
        create_qr_image(test_case['data'], test_case['filename'])
    
    print(f"\n🎉 All QR codes generated in '{output_dir}' folder!")
    print("\n📱 Test with your mobile app:")
    print("1. Open the generated PNG files")
    print("2. Use your app's QR scanner")
    print("3. Point camera at the QR codes on screen")
    
    # Also create a simple HTML viewer
    create_html_viewer(test_cases, output_dir)

def create_html_viewer(test_cases, output_dir):
    """Create an HTML file to view all QR codes"""
    html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Trink Driver QR Test Codes</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f0f0f0; }
        .qr-container { 
            background: white; 
            margin: 20px 0; 
            padding: 20px; 
            border-radius: 10px;
            text-align: center;
        }
        .qr-image { max-width: 300px; }
        .qr-data { 
            background: #f8f8f8; 
            padding: 10px; 
            margin: 10px 0; 
            border-radius: 5px;
            font-family: monospace;
            text-align: left;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <h1>🚛 Trink Driver QR Test Codes</h1>
    <p>Use these QR codes to test your mobile app scanner</p>
"""
    
    for i, test_case in enumerate(test_cases):
        filename = os.path.basename(test_case['filename'])
        html_content += f"""
    <div class="qr-container">
        <h2>📦 {test_case['name']}</h2>
        <img src="{filename}" class="qr-image" alt="{test_case['name']}">
        <div class="qr-data">{test_case['data']}</div>
    </div>
"""
    
    html_content += """
</body>
</html>
"""
    
    html_file = f"{output_dir}/qr_test_viewer.html"
    with open(html_file, 'w') as f:
        f.write(html_content)
    
    print(f"📄 HTML viewer created: {html_file}")

if __name__ == "__main__":
    try:
        main()
    except ImportError as e:
        print("❌ Missing required packages!")
        print("Install with: pip install qrcode[pil]")
        print(f"Error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
