import urllib.request
import json
import sys

def test(name, payload, expected_status=200):
    req = urllib.request.Request(
        'http://localhost:3000/api/analyze',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"PASS: {name} -> status {resp.status} | verdict={data.get('verdict')} | risk={data.get('risk_level')} | cat={data.get('category')}")
            assert data.get('verdict') in ['SCAM', 'LIKELY_SCAM', 'SUSPICIOUS', 'LIKELY_LEGIT']
            assert data.get('risk_level') in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
            assert 'indicators' in data
            assert 'recommended_actions' in data
            assert 'already_affected' in data
    except urllib.error.HTTPError as e:
        err = json.loads(e.read().decode('utf-8'))
        if e.code == expected_status:
            print(f"PASS (Expected Error): {name} -> status {e.code} | message={err.get('error')}")
        else:
            print(f"FAIL: {name} -> status {e.code}")
            sys.exit(1)

print("=== Testing Live /api/analyze Endpoint ===")
test('Empty input', {'content': ''}, 400)
test('Whitespace input', {'content': '   \n\t  '}, 400)
test('Electricity scam', {'content': 'Dear consumer your electricity power will be disconnected tonight at 9:30pm from electricity office because your previous month bill was not updated. Please immediately call electricity officer at 9876543210.'})
test('KYC scam', {'content': 'URGENT SBI ALERT: Dear Customer, your SBI YONO account has been suspended today due to unverified PAN KYC. Click here to verify: https://sbi-kyc-update-portal.top/login to prevent permanent account suspension.'})
test('Legitimate bank alert', {'content': 'HDFC Bank: Rs 450.00 spent on your Debit Card ending 4821 on 11-SEP-26 at BLINKIT GROCERY. Avail Bal: Rs 14,820.50. If not done by you, SMS BLOCK 4821. Never share OTP or PIN.'})
test('Ambiguous greeting', {'content': 'Hello, are you Rahul? I lost my phone contacts list yesterday and your number was saved in my old SIM card.'})
print("=== All Live API Tests Passed! ===")
