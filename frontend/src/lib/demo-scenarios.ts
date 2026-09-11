export interface DemoScenario {
  id: string;
  title: string;
  category: string;
  label: string;
  badge: string;
  language: string;
  message: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'electricity',
    title: 'Electricity Disconnection',
    category: 'Electricity',
    label: 'Electricity scam',
    badge: 'Urgent Threat',
    language: 'English / Bengali mixed',
    message: 'Dear consumer your electricity power will be disconnected tonight at 9:30pm from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer Rahul Sharma at 9876543210 or update bill at http://wb-electricity-bill-pay.xyz immediately to avoid disconnection.',
  },
  {
    id: 'kyc',
    title: 'Bank KYC Deactivation',
    category: 'KYC / Identity',
    label: 'Fake KYC',
    badge: 'Account Threat',
    language: 'Hinglish / English',
    message: 'URGENT SBI ALERT: Dear Customer, your SBI YONO account has been suspended today due to unverified PAN KYC. Your debit card and net banking are blocked. Click here to verify your KYC online within 24 hours: https://sbi-kyc-update-portal.top/login to prevent permanent account suspension.',
  },
  {
    id: 'courier',
    title: 'Customs Courier Parcel',
    category: 'Courier / Delivery',
    label: 'Courier scam',
    badge: 'Customs Trap',
    language: 'English',
    message: 'FedEx Customs Notification: Your international parcel tracking #FX-8947291 has been held at Mumbai Airport Cargo Terminal. Suspicious narcotic and passport contraband detected inside. To avoid immediate CBI arrest warrant, pay clearance customs penalty fee of Rs 24,500 via UPI ID customs.clearing@icici within 2 hours.',
  },
  {
    id: 'upi_reverse',
    title: 'UPI Payment Refund Request',
    category: 'UPI / Payment',
    label: 'UPI scam',
    badge: 'Payment Trap',
    language: 'Hinglish',
    message: 'Sir I am Amit Sharma, by mistake I sent Rs 15,000 to your Google Pay number instead of my brother in hospital. Please send it back urgently or click on this Google Pay collect request link to refund: upi://pay?pa=amitrefund88@okhdfcbank&am=15000. Please enter your UPI PIN to approve refund.',
  },
  {
    id: 'digital_arrest',
    title: 'Police Digital Arrest',
    category: 'Police / Government Impersonation',
    label: 'Police / Digital Arrest',
    badge: 'Extortion',
    language: 'English / Hindi',
    message: 'Notice from Telecom Regulatory Authority of India (TRAI) & Mumbai Cyber Crime Cell: Your Aadhaar card has been linked to 14 illegal mobile numbers involved in money laundering and human trafficking. You are under Digital Arrest. Do not disconnect this WhatsApp video call or leave your house until verification fee is deposited.',
  },
  {
    id: 'job',
    title: 'YouTube Like / Part-Time Job',
    category: 'Job / Recruitment',
    label: 'Job scam',
    badge: 'Easy Money',
    language: 'English',
    message: 'Greetings! HR Team from Amazon India Global Career. Earn Rs 3,500 to Rs 8,000 daily working from home simply by liking YouTube videos and rating Google Maps restaurants. No experience needed. Join our official Telegram VIP group https://t.me/amazon_prepaid_task_vip now to receive your daily welcome bonus of Rs 500.',
  },
  {
    id: 'investment',
    title: 'Crypto / Stock Trading Scheme',
    category: 'Investment / Trading',
    label: 'Investment scam',
    badge: 'Guaranteed Returns',
    language: 'English',
    message: 'Exclusive Insider AI Crypto Trading Pool: Guaranteed 40% daily profit returns! Deposit minimum Rs 5,000 today and withdraw Rs 7,000 within 24 hours. Zero risk, 100% government approved SEBI scheme. Check verified member withdrawals: http://vip-quantum-ai-wealth.trade. Deposit USDT or UPI now.',
  },
  {
    id: 'customer_support',
    title: 'Fake Airline / Tech Support',
    category: 'Customer Support',
    label: 'Fake customer support',
    badge: 'Remote Access',
    language: 'English',
    message: 'Dear customer, your refund of Rs 4,890 for cancelled Indigo flight #6E-204 is stuck in payment gateway. To process instant credit to your bank account, please download and install AnyDesk Remote Support app from PlayStore and provide the 9-digit remote connection code to our agent.',
  },
  {
    id: 'legitimate_bank',
    title: 'Legitimate Bank Transaction Alert',
    category: 'UPI / Payment',
    label: 'Legitimate bank notification',
    badge: 'Safe Notice',
    language: 'English',
    message: 'HDFC Bank: Rs 450.00 spent on your Debit Card ending 4821 on 11-SEP-26 at BLINKIT GROCERY. Avail Bal: Rs 14,820.50. If not done by you, SMS BLOCK 4821 to 5676712 or call 18002026161. Never share OTP or PIN with anyone.',
  },
  {
    id: 'ambiguous',
    title: 'Ambiguous Unsolicited Greeting',
    category: 'Other',
    label: 'Ambiguous message',
    badge: 'Low Information',
    language: 'English',
    message: 'Hello, are you Rahul? I lost my phone contacts list yesterday and your number was saved in my old SIM card. Are we still meeting for lunch this weekend near the metro station?',
  },
];
