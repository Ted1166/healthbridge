# 🏥 HealthBridge

> **Decentralized Telemedicine Platform on Polkadot**  
> Connecting patients to verified specialists across borders and barriers

[![Built for Polkadot](https://img.shields.io/badge/Built%20for-Polkadot-E6007A?style=flat-square&logo=polkadot)](https://polkadot.network/)
[![ink! v5.1.1](https://img.shields.io/badge/ink!-v5.1.1-blue?style=flat-square)](https://use.ink/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**Built for:** Polkadot Cloud Builder Party 2025  
**Track:** User-centric Apps  
**Live Demo:** [Coming Soon]  
**Video Demo:** [Coming Soon]

---

## 🌟 The Problem

Healthcare access is fundamentally broken in underserved regions:

- **3+ month wait times** for specialist consultations in rural areas
- **60% of patients** arrive without complete medical histories
- **Geographic barriers** prevent access to quality specialists
- **Fragmented systems** lead to duplicate tests and delayed diagnoses
- **Trust issues** from credential fraud and fake medical certificates

**1.4 billion people globally** lack access to quality healthcare specialists.

---

## 💡 Our Solution

HealthBridge leverages Polkadot's infrastructure to create a **trustless, decentralized telemedicine platform** that:

✅ **Instant Access:** Connect patients with verified specialists in minutes, not months  
✅ **Patient-Owned Data:** Medical records controlled by patients, shared via blockchain  
✅ **Verified Credentials:** On-chain doctor verification prevents fraud  
✅ **Smart Escrow:** Automated payment handling with dispute resolution  
✅ **Cross-Chain Ready:** Multi-token payments via XCM (DOT, USDC, stablecoins)  
✅ **Privacy-First:** Client-side encryption, zero-knowledge proofs for sensitive data

---

## 🎯 Key Features

### **For Patients**
- 🔍 **Find Verified Doctors** - Browse specialists by specialty, rating, and availability
- 📅 **Book Consultations** - Schedule video appointments with automatic payment escrow
- 📁 **Own Your Records** - Complete control over who accesses your medical history
- 🚨 **Emergency Access** - Designated contacts can access records in emergencies
- ⭐ **Rate & Review** - Build doctor reputation through transparent feedback

### **For Doctors**
- 🏥 **Credential Verification** - Blockchain-verified medical licenses
- 📊 **Reputation System** - Build trust through completion rates and patient reviews
- 💰 **Automated Payments** - Smart contract escrow eliminates payment delays
- 📆 **Availability Management** - Set your schedule, prevent double-booking
- 🌍 **Global Reach** - Serve patients anywhere without geographic limitations

### **For Everyone**
- 🔒 **Privacy by Design** - End-to-end encryption, user-controlled data
- ⚖️ **Fair Disputes** - 24-hour dispute window with transparent resolution
- 🌐 **Cross-Chain** - Accept payments in multiple tokens via XCM
- 📱 **Mobile-First** - PWA works on smartphones, even with limited connectivity

---

## 🏗️ Architecture

### **Smart Contracts (ink! on Polkadot)**

```
┌─────────────────────────────────────────────────────────┐
│                    HEALTHBRIDGE                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ HealthRegistry   │  │ ConsultationEscrow│           │
│  ├──────────────────┤  ├──────────────────┤           │
│  │ • Doctor Reg     │  │ • Payment Escrow │           │
│  │ • Patient Reg    │  │ • Cancellation   │           │
│  │ • Verification   │  │ • No-Show Track  │           │
│  │ • Availability   │  │ • Dispute Mgmt   │           │
│  │ • Reputation     │  │ • Fee Splitting  │           │
│  └──────────────────┘  └──────────────────┘           │
│           │                      │                      │
│           └──────────┬───────────┘                      │
│                      │                                  │
│          ┌──────────────────────┐                      │
│          │ MedicalRecordsAccess │                      │
│          ├──────────────────────┤                      │
│          │ • Record Ownership   │                      │
│          │ • Access Control     │                      │
│          │ • Emergency Access   │                      │
│          │ • Bulk Permissions   │                      │
│          │ • Audit Trail        │                      │
│          └──────────────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### **1. HealthRegistry Contract**
**Purpose:** Manage healthcare provider and patient registration

**Key Functions:**
- `register_doctor()` - Register as a healthcare provider
- `register_patient()` - Register as a patient
- `verify_doctor()` - Admin verification of doctor credentials
- `set_availability()` - Doctors manage their schedule
- `get_doctor_stats()` - Retrieve reputation metrics
- `update_doctor_rating()` - Update ratings after consultations

**Stats Tracked:**
- Total consultations
- Completed consultations
- Cancellation rate
- No-show count
- Average rating
- Completion rate percentage

### **2. ConsultationEscrow Contract**
**Purpose:** Handle payment escrow and consultation lifecycle

**Key Functions:**
- `book_consultation()` - Patient books and pays for consultation
- `start_consultation()` - Doctor initiates the session
- `mark_completed()` - Doctor marks consultation as complete
- `release_payment()` - Release payment after 24h dispute window
- `cancel_consultation()` - Cancel with refund policy (100% >24h, 50% <24h)
- `report_no_show()` - Patient reports doctor no-show (full refund)
- `dispute_consultation()` - Patient disputes within 24h window

**Payment Flow:**
1. Patient pays → funds locked in escrow
2. Consultation happens → doctor marks complete
3. 24-hour dispute window
4. Auto-release → doctor receives payment minus platform fee (3%)

### **3. MedicalRecordsAccess Contract**
**Purpose:** Privacy-preserving medical record sharing

**Key Functions:**
- `register_record()` - Register a medical record
- `grant_access()` - Grant access to specific doctors
- `grant_access_bulk()` - Grant access to multiple records at once
- `revoke_access()` - Revoke access immediately
- `check_access()` - Verify if accessor has permission
- `emergency_access()` - Emergency contacts get temporary access (24h)
- `get_access_history()` - Audit trail of all access events

**Privacy Features:**
- Client-side encryption before upload
- Patient controls all access grants
- Automatic expiry for temporary access
- Complete audit trail
- Emergency override mechanism

---

## 🛠️ Tech Stack

### **Smart Contracts**
- **Language:** Rust
- **Framework:** ink! 5.1.1
- **Blockchain:** Polkadot (AssetHub / Custom Parachain)
- **Storage:** Crust Network (IPFS)
- **Testing:** ink! built-in test framework

### **Frontend** (Coming Soon)
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Shadcn/ui
- **State:** TanStack Query + Zustand
- **Blockchain:** Polkadot.js API
- **Video:** WebRTC (SimplePeer)

### **Infrastructure**
- **RPC:** OnFinality (with $200 free credits)
- **Indexer:** SubQuery
- **Storage:** Crust Network / IPFS
- **AI Assistant:** OnFinality MCP (for diagnostic support)

---

## 🚀 Getting Started

### **Prerequisites**

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup default stable
rustup update
rustup component add rust-src
rustup target add wasm32-unknown-unknown

# Install cargo-contract
cargo install cargo-contract --force --locked

# Verify installation
cargo contract --version
```

### **Clone & Build**

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/healthbridge.git
cd healthbridge

# Build all contracts
cd contracts/health_registry
cargo contract build

cd ../consultation_escrow
cargo contract build

cd ../medical_records_access
cargo contract build
```

### **Run Tests**

```bash
# Test each contract
cd contracts/health_registry
cargo test

cd ../consultation_escrow
cargo test

cd ../medical_records_access
cargo test
```

All tests should pass! ✅

---

## 📦 Deployment

### **Deploy to Testnet (Westend/Paseo)**

1. **Get Testnet Tokens:**
   - Visit https://faucet.polkadot.io/
   - Request testnet DOT

2. **Deploy Contracts:**
```bash
cd contracts/health_registry

# Upload contract code
cargo contract upload --suri "//YourSeed" --url wss://westend-rpc.polkadot.io

# Instantiate contract
cargo contract instantiate \
  --constructor new \
  --suri "//YourSeed" \
  --url wss://westend-rpc.polkadot.io
```

3. **Note Contract Addresses:**
Save the deployed contract addresses for frontend integration.

---

## 🧪 Testing

### **Unit Tests**

Each contract has comprehensive unit tests:

```bash
# Run all tests with coverage
cargo test

# Run specific test
cargo test test_name

# Run with output
cargo test -- --nocapture
```

**Test Coverage:**
- ✅ HealthRegistry: 5 tests (registration, verification, availability, stats)
- ✅ ConsultationEscrow: 4 tests (booking, completion, cancellation, disputes)
- ✅ MedicalRecordsAccess: 8 tests (access control, emergency access, bulk operations)

**Total: 17 tests, 100% passing**

### **Integration Tests**

Coming soon: End-to-end tests simulating real user workflows.

---

## 📖 Contract API Reference

### **HealthRegistry**

#### Register Doctor
```rust
#[ink(message)]
pub fn register_doctor(
    &mut self,
    name: String,
    specialty: String,
    license_number: String,
    license_ipfs_hash: String,
    consultation_fee: Balance,
) -> Result<()>
```

#### Get Doctor Statistics
```rust
#[ink(message)]
pub fn get_doctor_stats(&self, doctor: AccountId) -> Option<DoctorStats>
```

**Returns:**
```rust
pub struct DoctorStats {
    pub total_consultations: u32,
    pub completed_consultations: u32,
    pub cancelled_consultations: u32,
    pub no_show_count: u32,
    pub rating: u8,
    pub completion_rate: u8,
    pub verified: bool,
}
```

---

### **ConsultationEscrow**

#### Book Consultation
```rust
#[ink(message, payable)]
pub fn book_consultation(
    &mut self,
    doctor: AccountId,
    scheduled_time: u64,
) -> Result<u64>
```

**Parameters:**
- `doctor`: Doctor's account address
- `scheduled_time`: Unix timestamp for appointment
- **Payment:** Send DOT/tokens with transaction

**Returns:** `consultation_id`

#### Cancel Consultation
```rust
#[ink(message)]
pub fn cancel_consultation(&mut self, consultation_id: u64) -> Result<()>
```

**Refund Policy:**
- >24 hours before: 100% refund
- <24 hours before: 50% refund (50% to doctor as cancellation fee)

---

### **MedicalRecordsAccess**

#### Grant Access
```rust
#[ink(message)]
pub fn grant_access(
    &mut self,
    record_hash: Hash,
    granted_to: AccountId,
    access_level: AccessLevel,
    expires_at: Option<u64>,
) -> Result<()>
```

#### Bulk Grant Access
```rust
#[ink(message)]
pub fn grant_access_bulk(
    &mut self,
    record_hashes: Vec<Hash>,
    granted_to: AccountId,
    access_level: AccessLevel,
    expires_at: Option<u64>,
) -> Result<()>
```

---

## 🎨 Frontend (Coming Soon)

### **Planned Pages**

1. **Landing Page**
   - Hero section with problem/solution
   - How it works
   - Doctor/Patient CTAs

2. **Doctor Dashboard**
   - Profile & verification status
   - Availability calendar
   - Upcoming consultations
   - Earnings summary
   - Statistics & ratings

3. **Patient Dashboard**
   - Find doctors by specialty
   - Upcoming appointments
   - Medical records
   - Consultation history

4. **Consultation Room**
   - Video conferencing (WebRTC)
   - Chat panel
   - Medical notes editor
   - Record access controls

5. **Medical Records**
   - Upload/view records
   - Manage permissions
   - Access history
   - Emergency contacts

---

## 🔒 Security

### **Smart Contract Security**
- ✅ **Overflow Protection:** All arithmetic operations use `checked_*` methods
- ✅ **Access Control:** Role-based permissions for sensitive functions
- ✅ **Reentrancy Protection:** State updates before external calls
- ✅ **Input Validation:** All user inputs validated
- ✅ **Event Emission:** All state changes emit events for transparency

### **Privacy & Data Protection**
- ✅ **Client-Side Encryption:** Medical records encrypted before upload
- ✅ **User-Controlled Keys:** Only patients hold decryption keys
- ✅ **Temporary Access:** Time-limited permissions for doctors
- ✅ **Audit Trail:** Complete history of all data access
- ✅ **Emergency Override:** Secure emergency access mechanism

### **Payment Security**
- ✅ **Escrow System:** Funds locked until consultation complete
- ✅ **Dispute Window:** 24-hour window for patient disputes
- ✅ **Platform Fee:** Transparent 3% fee
- ✅ **No-Show Protection:** Automatic refunds for doctor no-shows

---

## 💰 Economics

### **Revenue Model**

**Platform Fee:** 3% of consultation payments

**Example Transaction:**
- Patient pays: 100 DOT
- Platform fee: 3 DOT (3%)
- Doctor receives: 97 DOT

**Cancellation Fees:**
- >24h before: 100% refund to patient
- <24h before: 50% refund, 50% to doctor
- No-show: 100% refund to patient

### **Token Support (Planned)**

Via Polkadot XCM:
- DOT (native)
- USDC
- USDT
- Other parachain tokens

---

## 🌍 Impact & Vision

### **Real-World Validation**

This project was built with input from **Dr. [Name], a practicing rheumatologist** who provided insights on:
- Healthcare access gaps in rural vs urban areas
- Pain points in current telemedicine systems
- Credential verification challenges
- Patient record fragmentation issues

### **Target Markets**

**Phase 1: Kenya** (Pilot)
- 50+ million population
- High mobile money adoption (M-Pesa)
- Significant urban-rural healthcare gap
- Active blockchain community

**Phase 2: Africa**
- 1.4 billion population
- Growing internet connectivity
- Critical healthcare access needs
- Leapfrog opportunity for Web3

**Phase 3: Global South**
- Southeast Asia, Latin America, Middle East
- Billions underserved by traditional healthcare
- High mobile adoption, low specialist access

### **Success Metrics**

**6 Months Post-Launch:**
- 50+ verified doctors
- 500+ registered patients
- 200+ consultations completed
- 90%+ completion rate
- <1% dispute rate

**12 Months Post-Launch:**
- 500+ doctors across 5 specialties
- 5,000+ patients
- 2,000+ consultations/month
- Partnerships with 3+ medical institutions
- Self-sustaining revenue

---

## 🏆 Hackathon Submission

### **Polkadot Cloud Builder Party 2025**

**Track:** User-centric Apps  
**Theme:** Radically open, radically useful

**Why HealthBridge Wins:**

✅ **Technological Implementation (40%)**
- Production-ready ink! smart contracts
- Comprehensive test coverage
- Cross-contract integration ready
- Advanced features (escrow, privacy, reputation)

✅ **Design (20%)**
- User-centric workflows
- Mobile-first approach
- Professional UI/UX (coming soon)
- Accessibility focused

✅ **Potential Impact (25%)**
- Addresses real healthcare crisis (1.4B people)
- Doctor-validated problem/solution
- Clear adoption pathway
- Measurable success metrics

✅ **Creativity (15%)**
- Novel application of Polkadot tech
- Unique privacy-preserving record sharing
- Smart escrow with dispute resolution
- Cross-chain payment support

### **Differentiation**

**vs. Traditional Telemedicine:**
- ❌ Centralized platforms take 20-30% fees
- ❌ Patient data owned by corporations
- ❌ Geographic restrictions
- ❌ Payment delays for doctors
- ❌ No credential verification

**HealthBridge:**
- ✅ Only 3% platform fee
- ✅ Patient-owned data
- ✅ Global accessibility
- ✅ Instant payments via escrow
- ✅ Blockchain-verified credentials

**vs. Other Web3 Health Projects:**
- Most are theoretical or abandoned
- Few have real doctor validation
- None have comprehensive escrow + records + reputation
- HealthBridge is production-ready

---

## 🗺️ Roadmap

### **Q4 2025 - MVP & Hackathon** ✅
- [x] Smart contract development
- [x] Contract testing & deployment
- [ ] Frontend development (in progress)
- [ ] Demo video production
- [ ] Hackathon submission

### **Q1 2026 - Beta Launch**
- [ ] Deploy to Polkadot mainnet
- [ ] Onboard 10 verified doctors
- [ ] Beta test with 50 patients
- [ ] Integrate video calling
- [ ] Mobile PWA launch

### **Q2 2026 - Public Launch**
- [ ] Marketing campaign (Kenya focus)
- [ ] Partnership with medical institutions
- [ ] AI diagnostic assistant integration
- [ ] Multi-language support
- [ ] iOS/Android native apps

### **Q3 2026 - Scale**
- [ ] Expand to 5+ African countries
- [ ] XCM integration for multi-token payments
- [ ] Insurance integration
- [ ] Prescription management
- [ ] Lab results integration

### **Q4 2026 - Growth**
- [ ] 500+ doctors, 5,000+ patients
- [ ] Partnerships with NGOs
- [ ] Grant funding secured
- [ ] Break-even profitability
- [ ] Series A preparation

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Development**
- 🐛 Report bugs via GitHub Issues
- 💡 Suggest features via Discussions
- 🔧 Submit PRs for bug fixes
- ⭐ Star the repo to show support

### **Testing**
- Test the contracts
- Provide feedback on UX
- Report security vulnerabilities

### **Spread the Word**
- Share on social media
- Write about HealthBridge
- Connect us with doctors/clinics

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

**Built for:** Polkadot Cloud Builder Party 2025  
**Inspired by:** Real healthcare challenges in underserved communities  
**Validated by:** Dr. [Name], Rheumatologist  
**Powered by:** Polkadot, ink!, Crust Network, OnFinality

**Special Thanks:**
- Web3 Foundation for organizing the hackathon
- Polkadot community for support
- Medical professionals who provided insights
- Open-source contributors

---

## 📞 Connect

**Developer:** [Your Name]  
**Twitter:** [@YourHandle]  
**Email:** your.email@example.com  
**GitHub:** https://github.com/YOUR_USERNAME/healthbridge  
**Demo:** [Coming Soon]

**Polkadot Builder Party:** https://polkadot.cloud/build-party

---

## 🌟 Star History

If you find HealthBridge useful, please ⭐ star this repo!

---

<div align="center">

### Built with ❤️ for a healthier, more accessible world

**Radically open. Radically useful.**

[⬆ Back to Top](#-healthbridge)

</div>