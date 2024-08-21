import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Servir arquivos estáticos

let pdfPath: string = ''; // Variável global para armazenar o caminho do PDF temporário

app.post('/save-content', async (req: Request, res: Response) => {
    const htmlContent: string = req.body.html;

    // Salva o conteúdo HTML em um arquivo temporário
    const filePath: string = path.join(__dirname, 'content.html');
    fs.writeFileSync(filePath, htmlContent);

    // Usa Puppeteer para gerar o PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Definindo o viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Defina o conteúdo da página
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Caminho onde o PDF será salvo temporariamente
    pdfPath = path.join(__dirname, 'slides.pdf');
    await page.pdf({
        path: pdfPath,
        width: '1280px',  // Defina a largura exata da página
        height: '720px', // Defina a altura exata da página
        printBackground: true,
        landscape: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 } // Margens ajustadas para zero
    });

    await browser.close();

    res.send('PDF gerado com sucesso');
});

// Rota GET para baixar o PDF e deletar os arquivos após o download
app.get('/download-pdf', (req: Request, res: Response) => {
    if (fs.existsSync(pdfPath)) {
        res.sendFile(pdfPath, (err) => {
            if (err) {
                console.error('Erro ao enviar o arquivo:', err);
            } else {
                // Deletar os arquivos temporários após o envio
                fs.unlinkSync(pdfPath);
                fs.unlinkSync(path.join(__dirname, 'content.html'));
            }
        });
    } else {
        res.status(404).send('PDF não encontrado. Por favor, gere primeiro.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
