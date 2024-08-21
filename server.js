const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Servir arquivos estáticos

let pdfPath = ''; // Variável global para armazenar o caminho do PDF

app.post('/save-content', async (req, res) => {
    const htmlContent = req.body.html;
    //console.log(htmlContent);

    // Salva o conteúdo HTML em um arquivo
    const filePath = path.join(__dirname, 'content.html');
    fs.writeFileSync(filePath, htmlContent);

    // Usa Puppeteer para gerar o PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Definindo o viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Defina o conteúdo da página
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Caminho onde o PDF será salvo temporariamente
    pdfPath = path.join(__dirname, 'slides.pdf');
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        landscape: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 } // Margens ajustadas para zero
    });

    await browser.close();

    res.send('PDF gerado com sucesso');
});


// Rota GET para baixar o PDF
app.get('/download-pdf', (req, res) => {
    if (fs.existsSync(pdfPath)) {
        res.sendFile(pdfPath);
    } else {
        res.status(404).send('PDF não encontrado. Por favor, gere primeiro.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
