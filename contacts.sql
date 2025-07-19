CREATE TABLE Contacts (
  Id INT PRIMARY KEY IDENTITY(1,1),
  Name NVARCHAR(100) NOT NULL,
  ContactType NVARCHAR(20), -- Buyer, Seller, Vendor, Group
  Email NVARCHAR(100),
  Phone NVARCHAR(20),
  Notes NVARCHAR(MAX),
  Status NVARCHAR(20) DEFAULT 'Active',
  LastVerified DATETIME NULL,
  CreatedAt DATETIME DEFAULT GETDATE()
);
