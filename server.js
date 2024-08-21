const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Servir arquivos estáticos

app.post('/save-content', async (req, res) => {
    const htmlContent = req.body.html;
    console.log(htmlContent)

    // Salva o conteúdo HTML em um arquivo
    const filePath = path.join(__dirname, 'content.html');
    fs.writeFileSync(filePath, htmlContent);

    // Usa Puppeteer para gerar o PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Defina o conteúdo da página
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({
        path: 'slides.pdf',
        format: 'A4',
        printBackground: true,
        landscape: true,
    });

    await browser.close();

    res.send('PDF gerado com sucesso');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
