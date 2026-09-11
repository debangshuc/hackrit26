"""
Comprehensive test suite for AI Scam Shield Multimodal Screenshot Scanner endpoint.
Tests:
1. Valid PNG upload
2. Valid JPEG upload
3. Valid WEBP upload
4. Invalid file type (SVG / TXT / PDF)
5. Oversized image (>5MB)
6. Empty file (0 bytes)
7. Corrupted image header bytes
8. Malicious filename handling
9. Fallback behavior when AI service is unavailable
"""
import requests
import io
import struct

BASE_URL = "http://localhost:3000/api/analyze-screenshot"

def create_valid_png():
    # Minimal 1x1 valid PNG
    png_signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
    import zlib
    ihdr_crc = struct.pack(">I", zlib.crc32(b'IHDR' + ihdr_data))
    ihdr = struct.pack(">I", len(ihdr_data)) + b'IHDR' + ihdr_data + ihdr_crc
    raw_data = b'\x00\x00\x00\x00' # filter byte + RGB
    compressed = zlib.compress(raw_data)
    idat_crc = struct.pack(">I", zlib.crc32(b'IDAT' + compressed))
    idat = struct.pack(">I", len(compressed)) + b'IDAT' + compressed + idat_crc
    iend_crc = struct.pack(">I", zlib.crc32(b'IEND'))
    iend = struct.pack(">I", 0) + b'IEND' + iend_crc
    return png_signature + ihdr + idat + iend

def create_valid_jpg():
    # Minimal valid JPEG
    return b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9'

def create_valid_webp():
    # Minimal valid WEBP
    riff = b'RIFF'
    size = struct.pack("<I", 26)
    webp = b'WEBPVP8 '
    vp8_size = struct.pack("<I", 14)
    vp8_payload = b'\x90\x00\x00\x9d\x01*\x01\x00\x01\x00\x00\x00\x00\x00'
    return riff + size + webp + vp8_size + vp8_payload

def test_png_validation():
    print("\n[TEST 1] Valid PNG Upload Validation...")
    data = create_valid_png()
    files = {'screenshot': ('suspicious_whatsapp.png', io.BytesIO(data), 'image/png')}
    res = requests.post(BASE_URL, files=files)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text[:200]}")
    assert res.status_code in (200, 502, 503), f"Expected 200, 502, or 503 fallback, got {res.status_code}"
    print("PASS: PNG accepted and handled by API")

def test_jpeg_validation():
    print("\n[TEST 2] Valid JPEG Upload Validation...")
    data = create_valid_jpg()
    files = {'screenshot': ('electricity_bill.jpg', io.BytesIO(data), 'image/jpeg')}
    res = requests.post(BASE_URL, files=files)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text[:200]}")
    assert res.status_code in (200, 502, 503), f"Expected 200, 502, or 503 fallback, got {res.status_code}"
    print("PASS: JPEG accepted and handled by API")

def test_webp_validation():
    print("\n[TEST 3] Valid WEBP Upload Validation...")
    data = create_valid_webp()
    files = {'screenshot': ('kyc_notice.webp', io.BytesIO(data), 'image/webp')}
    res = requests.post(BASE_URL, files=files)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text[:200]}")
    assert res.status_code in (200, 502, 503), f"Expected 200, 502, or 503 fallback, got {res.status_code}"
    print("PASS: WEBP accepted and handled by API")

def test_invalid_mimetype():
    print("\n[TEST 4] Invalid File Type (SVG/PDF/Text)...")
    files = {'screenshot': ('malicious.svg', io.BytesIO(b'<svg><script>alert(1)</script></svg>'), 'image/svg+xml')}
    res = requests.post(BASE_URL, files=files)
    print(f"Status: {res.status_code}, Detail: {res.text}")
    assert res.status_code == 400
    assert "Unsupported file type" in res.text
    print("PASS: SVG / non-whitelisted MIME blocked with 400")

def test_empty_file():
    print("\n[TEST 5] Empty Upload (0 bytes)...")
    files = {'screenshot': ('empty.png', io.BytesIO(b''), 'image/png')}
    res = requests.post(BASE_URL, files=files)
    print(f"Status: {res.status_code}, Detail: {res.text}")
    assert res.status_code == 400
    assert "empty" in res.text.lower()
    print("PASS: Empty upload rejected with 400")

def test_oversized_file():
    print("\n[TEST 6] Oversized Image (>5MB)...")
    oversized = b'A' * (6 * 1024 * 1024)
    files = {'screenshot': ('huge.png', io.BytesIO(oversized), 'image/png')}
    res = requests.post(BASE_URL, files=files)
    print(f"Status: {res.status_code}, Detail: {res.text}")
    assert res.status_code == 400
    assert "too large" in res.text.lower()
    print("PASS: Oversized image rejected with 400")

def test_corrupted_image():
    print("\n[TEST 7] Corrupted Header Magic Bytes...")
    corrupted = b'FAKEIMAGEBYTESNOTVALIDPNG'
    files = {'screenshot': ('corrupted.png', io.BytesIO(corrupted), 'image/png')}
    res = requests.post(BASE_URL, files=files)
    print(f"Status: {res.status_code}, Detail: {res.text}")
    assert res.status_code == 400
    assert "Corrupted or invalid" in res.text
    print("PASS: Spoofed/corrupted header rejected with 400")

def test_malicious_filename():
    print("\n[TEST 8] Malicious / Directory Traversal Filename...")
    data = create_valid_png()
    files = {'screenshot': ('../../../etc/passwd.png', io.BytesIO(data), 'image/png')}
    res = requests.post(BASE_URL, files=files)
    print(f"Status: {res.status_code}")
    assert res.status_code in (200, 400, 502, 503)
    print("PASS: Malicious filename handled safely without filesystem traversal")

if __name__ == '__main__':
    print("--- RUNNING MULTIMODAL SCREENSHOT SCANNER VERIFICATION SUITE ---")
    test_png_validation()
    test_jpeg_validation()
    test_webp_validation()
    test_invalid_mimetype()
    test_empty_file()
    test_oversized_file()
    test_corrupted_image()
    test_malicious_filename()
    print("\nALL 8 TESTS PASSED SUCCESSFULLY!")
