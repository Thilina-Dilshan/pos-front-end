const tblItemBody = $("#tbl-items tbody");
const modalElm = $("#new-items-modal");
const txtDescription = $("#txt-description");
const txtPrice = $("#txt-price");
const txtStock = $("#txt-stock");
const btnSave = $("#btn-save");

modalElm.on('show.bs.modal', () => {
    setTimeout(() => txtDescription.trigger('focus'), 500);
});

tblItemBody.empty();

[txtPrice, txtDescription, txtStock].forEach(txtElm =>{
    $(txtElm).addClass('animate__animated');
});


function formatItemCode(code) {
    return `I${code.toString().padStart(3, '0')}`;
}

btnSave.on('click',()=>{
    if (!validateItemData())return;


    const qty = txtStock.val().trim();
    const description = txtDescription.val().trim();
    const unitPrice = txtPrice.val().trim();

//    todo: update back end

    let item = {
        description,
        qty,
        unitPrice
    }

    const xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange',()=>{
        if (xhr.readyState === 4) {
            [txtDescription,txtStock,txtPrice, btnSave].forEach(elm => elm.removeAttr('disabled'));
            $("#loader").css('visibility', 'hidden');
            if (xhr.status === 201) {
                item = JSON.parse(xhr.responseText);
                console.log(item.unitPrice);
                tblItemBody.append(
                    `<tr>
                        <td class="text-center">${formatItemCode(item.code)}</td>
                        <td>${item.description}</td>
                        <td class="d-none d-xl-table-cell">${item.unitPrice}</td>
                        <td class="contact text-center">${item.qty}</td>
                        <td>
                            <div class="actions d-flex gap-3 justify-content-center">
                                <svg data-bs-toggle="tooltip" data-bs-title="Edit items" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                     class="bi bi-pencil-square" viewBox="0 0 16 16">
                                    <path
                                            d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path fill-rule="evenodd"
                                          d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                                <svg data-bs-toggle="tooltip" data-bs-title="Delete items" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                     class="bi bi-trash" viewBox="0 0 16 16">
                                    <path
                                            d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                    <path
                                            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                </svg>
                            </div>
                        </td>
                    </tr>`);
                resetForm(true);
                txtDescription.trigger('focus');
                showToast('success', 'Saved', 'Item has been saved successfully');
            }
        }else {
            const errorObj = JSON.parse(xhr.responseText);
            showToast('error', 'Failed to save', errorObj.message);
        }
    });

    xhr.open('POST', "http://localhost:8080/pos/items",true);

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(JSON.stringify(item));

    [txtDescription,txtStock,txtPrice, btnSave].forEach(elm => elm.attr('disabled', 'true'));
    $("#loader").css('visibility', 'visible');

});

function validateItemData(){
    let valid = true;
    let qty = txtStock.val().trim();
    let description = txtDescription.val().trim();
    let unitPrice = txtPrice.val().trim();
    resetForm();

    if (!qty) {
        valid = invalidateItem(txtStock,"Stock can't be empty")
    }else if(!/^\d{1,}$/.test(qty)){
        valid = invalidateItem(txtStock, "Invalid stock");
    }

    if (!unitPrice) {
        valid = invalidateItem(txtPrice,"Price can't be empty")
    }else if(!/^\d{1,5}(.)?(\d{1,2})?$/.test(unitPrice)){
        valid = invalidateItem(txtPrice, "Price should be within 1-100,000 LKR");
    }

    if (!description) {
        valid = invalidateItem(txtDescription,"Description can't be empty")
    }else if(!/^[a-zA-Z0-9- ]+$/.test(description)){
        valid = invalidateItem(txtDescription, "Invalid description");
    }

    return valid;
}


function invalidateItem(txt, msg) {
    setTimeout(() => txt.addClass('is-invalid animate__shakeX'), 0);
    txt.trigger('select');
    txt.next().text(msg);
    return false;
}

function resetForm(clearData) {
    [txtDescription, txtStock, txtPrice].forEach(txt => {
        txt.removeClass("is-invalid animate__shakeX");
        if (clearData) txt.val('');
    });
}

function showToast(toastType, header, message){
    const toast = $("#toast .toast");
    toast.removeClass("text-bg-success text-bg-warning text-bg-danger");
    switch (toastType) {
        case 'success':
            toast.addClass('text-bg-success');
            break;
        case 'warning':
            toast.addClass('text-bg-warning');
            break;
        case 'error':
            toast.addClass('text-bg-danger');
            break;
        default:
    }
    $("#toast .toast-header > strong").text(header);
    $("#toast .toast-body").text(message);
    toast.toast('show');
}

function getItems(){
    const xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange',()=>{
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                tblItemBody.empty();
                const itemList = JSON.parse(xhr.responseText);
                itemList.forEach(item => {
                    tblItemBody.append(
                        `<tr>
                        <td class="text-center">${formatItemCode(item.code)}</td>
                        <td>${item.description}</td>
                        <td class="d-none d-xl-table-cell">${item.unitPrice}</td>
                        <td class="contact text-center">${item.qty}</td>
                        <td>
                            <div class="actions d-flex gap-3 justify-content-center">
                                <svg data-bs-toggle="tooltip" data-bs-title="Edit items" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                     class="bi bi-pencil-square" viewBox="0 0 16 16">
                                    <path
                                            d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path fill-rule="evenodd"
                                          d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                                <svg data-bs-toggle="tooltip" data-bs-title="Delete items" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                     class="bi bi-trash" viewBox="0 0 16 16">
                                    <path
                                            d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                    <path
                                            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                </svg>
                            </div>
                        </td>
                    </tr>`);
                });
                if (!itemList.length) {
                    $('#tbl-items tfoot').show();
                } else {
                    $('#tbl-items tfoot').hide();
                }

            } else {
                $("#tbl-items tfoot").show();
                showToast('error', 'Failed', 'Failed to fetch items');
                console.log(JSON.parse(xhr.responseText));
            }
        }
    });

    const searchText = $("#txt-search").val().trim();

    console.log(searchText);

    const query = (searchText) ? `?q=${searchText}` : "";

    xhr.open('GET', "http://localhost:8080/pos/items" + query, true);

    xhr.send();
}

getItems();

$("#txt-search").on('input',()=> getItems());

