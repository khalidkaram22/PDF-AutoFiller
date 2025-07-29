let fields = [], availableHeaders = [], fontBytes = null, customFontName = null;

const sheetInput = document.getElementById('sheetInput'),
      pdfInput = document.getElementById('pdfInput'),
      filenameColumn = document.getElementById('filenameColumn'),
      fontInput = document.getElementById('fontInput'),
      addFieldBtn = document.getElementById('addFieldBtn'),
      templateArea = document.getElementById('templateArea'),
      fieldList = document.getElementById('fieldList'),
      generateBtn = document.getElementById('generateBtn'),
      status = document.getElementById('status');

fontInput.addEventListener('change', async () => {
  const f = fontInput.files[0];
  fontBytes = f ? await f.arrayBuffer() : null;
  customFontName = f ? f.name : null;
  status.textContent = f ? `Loaded font: ${f.name}` : 'Using default font';
});

sheetInput.addEventListener('change', async () => {
  const buf = await sheetInput.files[0].arrayBuffer();
  const wb = XLSX.read(buf,{type:'array'});
  const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''});
  availableHeaders = raw[0].map(h=>String(h).trim());
  status.textContent = `Columns: ${availableHeaders.join(', ')}`;
});

pdfInput.addEventListener('change', async () => {
  const buf = await pdfInput.files[0].arrayBuffer();
  const pdf = await pdfjsLib.getDocument(new Uint8Array(buf)).promise;
  const page = await pdf.getPage(1);
  const vp = page.getViewport({scale:1.5});
  const canvas = document.createElement('canvas');
  canvas.width = vp.width; canvas.height = vp.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  templateArea.style.backgroundImage = `url(${canvas.toDataURL()})`;
  templateArea.style.width = vp.width+'px';
  templateArea.style.height = vp.height+'px';
});

addFieldBtn.onclick = () => {
  const wrapper = document.createElement('div');
  wrapper.className='field-wrapper';
  wrapper.style.left='20px'; wrapper.style.top='20px';

  const input = document.createElement('div');
  input.className='field-input'; input.contentEditable=true;
  input.innerText='{{ColumnName}}';
  input.style.direction = 'rtl';  // Support Arabic

  const select = document.createElement('select');
  select.innerHTML = `<option disabled selected>Bind column</option>`+availableHeaders.map(h=>`<option>${h}</option>`).join('');
  select.onchange = ()=> input.innerText=`{{${select.value}}}`;

  const fontSelect = document.createElement('select');
  ['Helvetica','Times Roman','Courier'].forEach(f=>fontSelect.innerHTML+=`<option>${f}</option>`);

  const sizeInput = document.createElement('input');
  sizeInput.type='number'; sizeInput.value=14; sizeInput.style.width='50px';
  sizeInput.oninput = ()=> input.style.fontSize = sizeInput.value+'px';

  const widthInput = document.createElement('input');
  widthInput.type='number'; widthInput.value=200; widthInput.style.width='60px';
  widthInput.oninput = ()=> input.style.width = widthInput.value+'px';

  const colorInput = document.createElement('input');
  colorInput.type='color'; colorInput.value='#000000';
  colorInput.oninput = ()=> input.style.color = colorInput.value;

  const alignSelect = document.createElement('select');
  ['left','center','right'].forEach(a=>alignSelect.innerHTML+=`<option>${a}</option>`);
  alignSelect.onchange = ()=>{
    input.style.textAlign = alignSelect.value;
    input.style.justifyContent = alignSelect.value==='center'?'center':(alignSelect.value==='right'?'flex-end':'flex-start');
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '❌';
  deleteBtn.style.fontSize = '12px';
  deleteBtn.style.padding = '2px 6px';
  deleteBtn.onclick = () => {
    templateArea.removeChild(wrapper);
    fields = fields.filter(f => f.wrapper !== wrapper);
  };

  const posLabel = document.createElement('div');
  posLabel.className='pos-label';
  posLabel.innerText = 'X:20, Y:20';

  const ctrls = document.createElement('div');
  ctrls.className='field-controls';
  ctrls.append(select,fontSelect,sizeInput,widthInput,colorInput,alignSelect, deleteBtn);

  wrapper.append(input,ctrls,posLabel);
  templateArea.appendChild(wrapper);
  fields.push({wrapper,input,fontSelect,sizeInput,widthInput,colorInput,alignSelect});
  makeDraggable(wrapper,posLabel);
};

function makeDraggable(el,label){
  let drag=false,ox=0,oy=0;
  el.onmousedown = e => { if(e.target.isContentEditable||['INPUT','SELECT','BUTTON'].includes(e.target.tagName))return; drag=true; ox = e.clientX-el.offsetLeft; oy = e.clientY-el.offsetTop; };
  document.onmousemove = e => {
    if(!drag) return;
    const r = templateArea.getBoundingClientRect();
    let nx = e.clientX-ox, ny = e.clientY-oy;
    nx = Math.max(0, Math.min(nx, r.width-el.offsetWidth));
    ny = Math.max(0, Math.min(ny, r.height-el.offsetHeight));
    el.style.left = nx+'px'; el.style.top = ny+'px';
    label.innerText = `X:${Math.round(nx)}, Y:${Math.round(ny)}`;
  };
  document.onmouseup = () => drag=false;
}

generateBtn.onclick = async ()=>{
  status.textContent='';
  if(!sheetInput.files[0]||!pdfInput.files[0]||!filenameColumn.value.trim()||fields.length===0){
    status.textContent='Upload everything and add at least one field.'; return;
  }

  try{
    const [sheetBuf,pdfBuf] = await Promise.all([
      sheetInput.files[0].arrayBuffer(),
      pdfInput.files[0].arrayBuffer()
    ]);
    const wb = XLSX.read(sheetBuf,{type:'array'});
    const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''});
    const headers = raw[0].map(h=>String(h).trim()), lower={};
    headers.forEach(h=> lower[h.toLowerCase()] = h);
    const fnameKey = lower[filenameColumn.value.trim().toLowerCase()];
    const rows = raw.slice(1).map(r=>{
      const o={}; headers.forEach((h,i)=> o[h] = r[i]!==undefined? r[i] : ''); return o;
    });

    const zip = new JSZip();
    for(const row of rows){
      const pdfDoc = await PDFLib.PDFDocument.load(pdfBuf);
      if(fontBytes) pdfDoc.registerFontkit(fontkit);
      const page = pdfDoc.getPage(0);
      const {width:pw,height:ph} = page.getSize();
      const rect = templateArea.getBoundingClientRect();
      const scaleX = pw/rect.width, scaleY = ph/rect.height;

      for(const f of fields){
        const txt = f.input.innerText.replace(/{{\s*([^}]+)\s*}}/gi,(_,k)=> row[lower[k.toLowerCase()]]||'');

        const embedFont = fontBytes
          ? await pdfDoc.embedFont(fontBytes)
          : await pdfDoc.embedFont(PDFLib.StandardFonts[f.fontSelect.value] || PDFLib.StandardFonts.Helvetica);

        const sz = parseInt(f.sizeInput.value)||14;
        const xPDF = f.wrapper.offsetLeft * scaleX;
        const yPDF = ph - f.wrapper.offsetTop * scaleY - sz;
        const widthBox = parseInt(f.widthInput.value)*scaleX;
        const color = hexToRgb(f.colorInput.value);
        const align = f.alignSelect.value;

        const lines = splitTextIntoLines(txt,embedFont,sz,widthBox);
        let offsetY=0;
        for(const line of lines){
          const lw = embedFont.widthOfTextAtSize(line,sz);
          let drawX = xPDF;
          if(align==='center') drawX = xPDF + (widthBox-lw)/2;
          else if(align==='right') drawX = xPDF + widthBox-lw;

          page.drawText(line, {
            x: drawX, y: yPDF-offsetY, size: sz, font: embedFont,
            color: PDFLib.rgb(color.r/255,color.g/255,color.b/255),
            maxWidth: widthBox
          });

          offsetY += sz*1.2;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const safe = (row[fnameKey]||'output').toString().replace(/[\\/:"*?<>|]+/g,'_');
      zip.file(`${safe}.pdf`, pdfBytes);
    }

    const blob = await zip.generateAsync({type:'blob'});
    saveAs(blob,'merged.zip');
    status.textContent = `Generated ${rows.length} PDFs successfully!`;

  }catch(err){
    console.error(err);
    status.textContent='Error: '+err.message;
  }
};

function splitTextIntoLines(text,font,size,maxWidth){
  const words = text.split(' '), lines = [];
  let line = '';
  for(const w of words){
    const test = line? line+' '+w : w;
    const wPx = font.widthOfTextAtSize(test,size);
    if(wPx>maxWidth && line){ lines.push(line); line = w; }
    else line=test;
  }
  if(line) lines.push(line);
  return lines;
}

function hexToRgb(hex){
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m? {r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)} : {r:0,g:0,b:0};
        }
