const createSessionId = (sources) => {
    let id = '';
    for (let s of sources) {
        id += `(${s.name}-${s.type}-${s.order})`
    } return id;
}

module.exports = createSessionId;
