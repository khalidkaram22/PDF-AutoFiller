# PDF-AutoFiller

**PDF-AutoFiller** is a web-based tool that allows you to generate customized PDF certificates by dynamically inserting data from Excel or CSV files into a pre-designed PDF template. Ideal for educators, trainers, event organizers, or anyone who needs to automate certificate or document creation in bulk.



---

## 🚀 Features

- 🧾 Upload an Excel (.xlsx/.xls/.csv) file as a data source
- 📄 Upload a PDF template with a background
- 🔠 Add dynamic text fields with column bindings (`{{ColumnName}}`)
- 🎨 Customize font, size, color, alignment, and width of text fields
- 🪟 Drag-and-drop field positioning on the template
- 🔤 Support for custom fonts (TTF/OTF)
- 📦 Generate multiple filled PDFs and download them as a ZIP file

---

## 🧰 Technologies Used

- HTML + CSS + JavaScript
- [TailwindCSS](https://tailwindcss.com/)
- [pdf-lib](https://pdf-lib.js.org/) – for PDF manipulation
- [pdf.js](https://mozilla.github.io/pdf.js/) – to render PDFs on the browser
- [SheetJS](https://sheetjs.com/) – for reading spreadsheet files
- [JSZip](https://stuk.github.io/jszip/) – for zipping files
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) – for downloading the ZIP

---

## 📂 PDF-AutoFiller/
├── index.html # Main HTML interface
├── style.css # Custom styling for the layout and fields
├── script.js # Main logic and interactivity
└── README.md # Project documentation



---

## ✅ How to Use

1. Open the app: [Live Demo](https://khalidkaram22.github.io/PDF-AutoFiller)
2. Upload the following:
   - A **spreadsheet** (CSV/XLSX) containing the data
   - A **PDF template** for background layout
   - *(Optional)* A custom font (.ttf or .otf)
3. Click **Add Text Field**, drag and customize the fields.
4. Bind each field to a column using `{{ColumnName}}`
5. Click **Generate PDFs & Download ZIP**

---

## 🌐 Live Demo

Try the app instantly:  
🔗 [https://your-khalidkaram22.github.io/PDF-AutoFiller](https://khalidkaram22.github.io/PDF-AutoFiller)

---

## ✍️ Example Use Cases

- Certificates of participation/completion
- Event badges
- Student report cards
- Bulk invoice or letter generation

---

## 📃 License

This project is licensed under the **MIT License** — feel free to use and modify it.

---

## 🙌 Contribution

Contributions are welcome! Feel free to fork this repo and submit pull requests.

---

## 📧 Contact

Made with 💻 by [Khalid karam]  
📫 Reach me on [LinkedIn]([https://www.linkedin.com/](https://www.linkedin.com/in/khalid-karam-44671b244/)) | [Email](khalid.karam11@gmail.com)
