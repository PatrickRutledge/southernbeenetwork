const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

// SQL configuration using managed identity
const sqlConfig = {
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  authentication: {
    type: 'azure-active-directory-msi-app',
  },
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// Validate required fields
const validateSubmission = (submission) => {
  const required = ['tradeName', 'region', 'category'];
  const missing = required.filter(field => !submission[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  // Validate length constraints
  if (submission.tradeName.length > 100) {
    throw new Error('Trade name must be 100 characters or less');
  }
  if (submission.description && submission.description.length > 500) {
    throw new Error('Description must be 500 characters or less');
  }
  
  return true;
};

// Sanitize and prepare submission for storage
const sanitizeSubmission = (raw) => ({
  tradeName: raw.tradeName?.trim(),
  region: raw.region?.trim().toLowerCase(),
  category: raw.category?.trim().toLowerCase(),
  description: raw.description?.trim() || null,
  contactEmail: raw.contactEmail?.trim().toLowerCase() || null,
  badges: Array.isArray(raw.badges) ? raw.badges.map(b => b.trim().toLowerCase()) : []
});

module.exports = async function (context, req) {
  context.log('Processing bee network submission');
  
  try {
    // Validate and sanitize input
    const submission = sanitizeSubmission(req.body);
    validateSubmission(submission);

    // Connect to database
    const pool = await sql.connect(sqlConfig);
    
    // Start transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      // Insert into Listings table
      const listingId = uuidv4();
      await transaction.request()
        .input('id', sql.UniqueIdentifier, listingId)
        .input('tradeName', sql.NVarChar(100), submission.tradeName)
        .input('region', sql.NVarChar(50), submission.region)
        .input('category', sql.NVarChar(50), submission.category)
        .input('description', sql.NVarChar(500), submission.description)
        .input('contactEmail', sql.NVarChar(100), submission.contactEmail)
        .input('submittedAt', sql.DateTimeOffset, new Date())
        .query(`
          INSERT INTO Listings (
            Id, TradeName, Region, Category, Description, 
            ContactEmail, SubmittedAt, Status
          ) VALUES (
            @id, @tradeName, @region, @category, @description,
            @contactEmail, @submittedAt, 'Pending'
          )
        `);

      // Add to DigestQueue
      await transaction.request()
        .input('id', sql.UniqueIdentifier, uuidv4())
        .input('listingId', sql.UniqueIdentifier, listingId)
        .input('queuedAt', sql.DateTimeOffset, new Date())
        .query(`
          INSERT INTO DigestQueue (Id, ListingId, QueuedAt, Status)
          VALUES (@id, @listingId, @queuedAt, 'New')
        `);

      // Process badges if any
      if (submission.badges?.length > 0) {
        for (const badge of submission.badges) {
          await transaction.request()
            .input('listingId', sql.UniqueIdentifier, listingId)
            .input('badge', sql.NVarChar(50), badge)
            .query(`
              INSERT INTO Badges (ListingId, BadgeName)
              SELECT @listingId, @badge
              WHERE EXISTS (
                SELECT 1 FROM BadgeDefinitions 
                WHERE Name = @badge AND IsActive = 1
              )
            `);
        }
      }

      // Commit transaction
      await transaction.commit();

      // Return success response
      context.res = {
        status: 200,
        body: {
          id: listingId,
          message: "Submission received successfully",
          status: "Pending moderation"
        }
      };

    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    } finally {
      // Close pool
      await pool.close();
    }

  } catch (error) {
    context.log.error('Submission processing failed:', error);
    context.res = {
      status: error.message.includes('Missing required fields') ? 400 : 500,
      body: {
        error: error.message.includes('Missing required fields') 
          ? error.message 
          : 'An error occurred processing your submission. Please try again later.'
      }
    };
  }
    Email,
  } = req.body;

  if (!TradeName || !ContactName || !Region) {
    context.res = {
      status: 400,
      body: 'Missing required fields.',
    };
    return;
  }

  const connection = new Connection(sqlConfig);

  const query = `
    INSERT INTO Listings (TradeName, ContactName, Region, Category, Description, IsPremium, Email, Status)
    VALUES (@TradeName, @ContactName, @Region, @Category, @Description, @IsPremium, @Email, 'Pending')
  `;

  connection.on('connect', err => {
    if (err) {
      context.res = { status: 500, body: 'Connection failed.' };
    } else {
      const request = new Request(query, err => {
        if (err) {
          context.res = { status: 500, body: 'Insert failed.' };
        } else {
          context.res = { status: 200, body: 'Listing submitted successfully.' };
        }
      });

      request.addParameter('TradeName', TYPES.VarChar, TradeName);
      request.addParameter('ContactName', TYPES.VarChar, ContactName);
      request.addParameter('Region', TYPES.VarChar, Region);
      request.addParameter('Category', TYPES.VarChar, Category || '');
      request.addParameter('Description', TYPES.VarChar, Description || '');
      request.addParameter('IsPremium', TYPES.Bit, IsPremium ? 1 : 0);
      request.addParameter('Email', TYPES.VarChar, Email || '');

      connection.execSql(request);
    }
  });

  connection.connect();
};

