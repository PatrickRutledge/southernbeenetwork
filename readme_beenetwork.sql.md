# 🐝 BeeNetwork SQL Schema – Civic Directory Infrastructure

## 🧭 Overview

This directory defines the full SQL schema powering **BeeNetwork**, a civic-grade platform for connecting beekeepers, educators, suppliers, and community organizers. All tables are:

- ✅ **Ledger-enabled** (`WITH LEDGER = ON`)
- ✅ **System-versioned** (`SYSTEM_VERSIONING = ON`)
- ✅ Built to reflect **symbolic civic tagging**, **premium engagement tiers**, and **map integration**

Created and stewarded by **Patrick Rutledge**  
Launched: July 2025

---

## 📁 File Map

| File Name             | Purpose |
|------------------------|---------|
| `listings.sql`         | Core table with civic tags, seller info, engagement tier, map coordinates |
| `listings_tags.sql`    | Reference values for tags: Region, Category, SellerType |
| `reviews.sql`          | Moderated community feedback tied to listings |
| `events.sql`           | Civic event schema with date + geolocation |
| `polls.sql`            | Annual polling structure + responses |
| `contacts.sql`         | CRM and stewardship contact directory |
| `badges.sql`           | Tracks badge issuance and verification |
| `users_roles.sql`      | Login and role provisioning for moderation and stewardship |
| `seed.sql`             | Sample inserts to test schema flow and listing visibility |

---

## 🧱 Civic Tagging System

All listings include symbolic attributes for public filtering, moderation, and audit:

- `StateRegion`: Two-letter U.S. code (`MO`, `TX`, etc.)
- `SellerType`: `Hobbyist`, `Commercial`, `Educational`, `Collective`
- `EngagementTier`: `Free`, `Premium`, `Partner`
- `BadgeStatus`: `None`, `Issued`, `Verified`
- `Latitude` / `Longitude`: Used for map rendering

Tag references live in `listings_tags.sql` and are seeded on database creation.

---

## 🔐 Integrity Features

- **SQL Ledger** ensures all mutations are immutable and auditable
- **Digest storage** configured in Azure Blob with 10-year retention
- **Transparent Data Encryption (TDE)** active with customer-managed key
- **Firewall and IP Access** configured via CLI for secure access

---

## 🧪 Usage Notes

To deploy tables, use Azure CLI or Azure Data Studio:

```bash
sqlcmd -S bee-network-sql.database.windows.net -d BeeNetworkDB -U <login> -P <password> -i listings.sql
