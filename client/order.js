let domElement = document.querySelector('div[data-type="content"]').addEventListener('click', (e) => {
    const target = e.target;
    const cl = Object.values(target.classList);
    if ((cl.indexOf('day') !== -1) ||
        (cl.indexOf('time_point') !== -1) ||
        (cl.indexOf('service_p') !== -1) ||
        (cl.indexOf('master_n') !== -1)) {
        const className = target.className;
        const elems = document.querySelectorAll(`.${className}`);
        for (let i = 0; i < elems.length; i++) {
            elems[i].style.background = "none";
            elems[i].style.color = "black";
        }

        target.style.background = 'purple';
        target.style.color = 'white';
    }
});