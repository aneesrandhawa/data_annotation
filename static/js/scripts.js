let labels = [];

document.querySelector('.custom-file-input').addEventListener('change', function (e) {
    var fileName = document.getElementById("fileInput").files[0].name;
    var nextSibling = e.target.nextElementSibling;
    nextSibling.innerText = fileName;
});

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            displayData(data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayData(data) {
    const dataTable = document.getElementById('dataTable');
    dataTable.innerHTML = '';

    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        // th.textContent = header;
        // Create and configure checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'select-column';
        checkbox.setAttribute('data-col', Number(header));
        th.appendChild(checkbox)
        headerRow.appendChild(th);
    });
    const th = document.createElement('th');
    th.textContent = 'Labels';
    headerRow.appendChild(th);
    dataTable.appendChild(headerRow);

    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        tr.id = `row-${rowIndex + 1}`;
        // tr.addEventListener('click', () => highlightRow(tr));
        headers.forEach(header => {
            const td = document.createElement('td');
            td.contentEditable = false;
            td.textContent = row[header];
            td.id = `cell-${header}`;
            td.addEventListener('click', (event, tr) => {highlightCell(event,td)})
            tr.appendChild(td);
        });
        const labelTd = document.createElement('td');
        labelTd.classList.add('label-cell');
        // labelTd.addEventListener('click', (event) => showLabelDropdown(event, labelTd));
        tr.appendChild(labelTd);
        dataTable.appendChild(tr);
    });
}

// function highlightRow(row) {
//     const rows = document.querySelectorAll('#dataTable tr');
//     rows.forEach(r => r.classList.remove('highlight'));
//     console.log(row)
//     row.classList.add('highlight');
// }

async function highlightCell(event, cell)
{
    // debugger;
    label_list = []
    const cells = document.querySelectorAll('#dataTable td');
    cells.forEach(c => c.classList.remove('highlighted-cell'));
    // const rows = document.querySelectorAll('#dataTable tr');
    // rows.forEach(r => r.classList.remove('highlight'));
    cell.classList.add('highlighted-cell');
    row = cell.parentElement

    event.stopPropagation();

    // Remove existing dropdown if any
    const existingDropdowns = document.querySelectorAll('.dropdown');
    if (existingDropdowns.length) existingDropdowns.forEach(existingDropdown => existingDropdown.remove());

    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');

    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dropdown-menu');
    labels.forEach(label => {
        const dropdownItem = document.createElement('div');
        dropdownItem.classList.add('dropdown-item');
        dropdownItem.textContent = label;
        dropdownItem.addEventListener('click', () => assignLabel(cell, label, row));
        dropdownMenu.appendChild(dropdownItem);
    });
    dropdown.appendChild(dropdownMenu);
    cell.appendChild(dropdown);

    const rect = cell.getBoundingClientRect();
    const dropdownWidth = dropdown.offsetWidth;
    const viewportWidth = window.innerWidth;

    let dropdownLeft = rect.left;
    let dropdownTop = rect.bottom;

    // Adjust left position if dropdown overflows the viewport
    if (rect.left + dropdownWidth > viewportWidth) {
        dropdownLeft = rect.right - dropdownWidth;
    }

    dropdown.style.left = `${dropdownLeft}px`;
    dropdown.style.top = `${dropdownTop}px`;
    dropdown.style.display = 'block';


    document.addEventListener('click', () => {
        dropdown.remove();
    }, { once: true });
}

function addLabels() {
    const labelsInput = document.getElementById('labelsInput').value;
    labels = labelsInput.split(',').map(label => label.trim());
}

function showLabelDropdown(event, cell) {
    event.stopPropagation();

    // Remove existing dropdown if any
    const existingDropdown = document.querySelector('.dropdown');
    if (existingDropdown) existingDropdown.remove();

    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');

    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dropdown-menu');
    labels.forEach(label => {
        const dropdownItem = document.createElement('div');
        dropdownItem.classList.add('dropdown-item');
        dropdownItem.textContent = label;
        dropdownItem.addEventListener('click', () => assignLabel(cell, label));
        dropdownMenu.appendChild(dropdownItem);
    });
    dropdown.appendChild(dropdownMenu);
    document.body.appendChild(dropdown);

    const rect = cell.getBoundingClientRect();
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.top = `${rect.bottom}px`;
    dropdown.style.display = 'block';

    document.addEventListener('click', () => {
        dropdown.remove();
    }, { once: true });
}

function assignLabel(cell, label, row) {
    console.log(cell.id,row.id, label)
    label_obj = {row_index:row.id,cell_index:cell.id ,label:label}
    // label_list.append(label_obj)
    // cell.textContent = label;
    lebel_cell = document.querySelector(`#${row.id}`).querySelector('.label-cell')
    lebel_cell.textContent += JSON.stringify(label_obj) 
    // Remove existing dropdown if any
    const existingDropdowns = document.querySelectorAll('.dropdown');
    if (existingDropdowns.length) existingDropdowns.forEach(existingDropdown => existingDropdown.remove());
}

function saveAnnotations() {
    const dataTable = document.getElementById('dataTable');
    const rows = dataTable.querySelectorAll('tr');
    const annotations = [];

    const headers = Array.from(rows[0].querySelectorAll('th')).map(th => th.textContent);

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        const row = {};
        cells.forEach((cell, index) => {
            row[headers[index]] = cell.textContent;
        });
        annotations.push(row);
    }

    fetch('/save_annotations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ annotations: annotations })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
