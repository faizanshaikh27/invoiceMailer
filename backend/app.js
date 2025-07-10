const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

fs.ensureDirSync('./uploads');
fs.ensureDirSync('./pdfs');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Upload Route
app.post('/upload', upload.array('invoices', 60), async (req, res) => {
  try {
    const recipientEmail = req.body.email;
    if (!recipientEmail) {
      return res.status(400).json({ error: 'Recipient email is required.' });
    }

    const pdfPath = 'pdfs/scanned-invoices.pdf';
    const doc = new PDFDocument({ autoFirstPage: false });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    for (const file of req.files) {
      doc.addPage();
      doc.image(file.path, {
        fit: [500, 700],
        align: 'center',
        valign: 'center'
      });
    }

    doc.end();

    stream.on('finish', async () => {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"Invoice System" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: 'Scanned Invoice PDFs',
        text: 'Please find the attached scanned invoices.',
        attachments: [{ filename: 'invoices.pdf', path: pdfPath }]
      });

      res.status(200).json({ message: 'Invoices converted and emailed successfully!' });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
