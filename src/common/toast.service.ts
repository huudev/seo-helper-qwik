let container: HTMLDivElement
let isAppendContainer = false

export function showSucessNoti(content: string) {
    if (!isAppendContainer) {
        container = document.createElement('div')
        container.className = 'position-fixed d-flex flex-column gap-3';
        container.style.top = '5px';
        container.style.right = '5px';
        document.body.appendChild(container)
        isAppendContainer = true
    }

    // Create the main div element with the "toast" classes
    const toastDiv = document.createElement('div');
    toastDiv.className = 'toast text-white bg-primary border-0 fade show showing';

    // Create the inner div for the toast content
    const toastInnerDiv = document.createElement('div');
    toastInnerDiv.className = 'd-flex';

    // Create the toast body div
    const toastBodyDiv = document.createElement('div');
    toastBodyDiv.className = 'toast-body';
    toastBodyDiv.textContent = content;

    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close btn-close-white me-2 m-auto';
    closeButton.setAttribute('data-bs-dismiss', 'toast');
    closeButton.setAttribute('aria-label', 'Close');

    const hideHandler = () => {
        toastDiv.classList.add('showing')
        setTimeout(() => {
            toastDiv.classList.remove('showing', 'show')
            setTimeout(() => {
                closeButton.removeEventListener('click', closeHandler)
                toastDiv.remove()
            })
        })
    }
    let autoHideTimeOut: ReturnType<typeof setTimeout>
    const closeHandler = () => {
        clearTimeout(autoHideTimeOut)
        hideHandler()
    }
    closeButton.addEventListener('click', closeHandler, { once: true })

    // Append the elements to build the hierarchy
    toastInnerDiv.appendChild(toastBodyDiv);
    toastInnerDiv.appendChild(closeButton);

    toastDiv.appendChild(toastInnerDiv)

    container.appendChild(toastDiv)

    setTimeout(() => {
        toastDiv.classList.remove('showing')
        autoHideTimeOut = setTimeout(() => {
            hideHandler()
        }, 1000)
    })
}
