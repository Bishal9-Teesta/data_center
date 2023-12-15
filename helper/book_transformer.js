
const book_transformer = (string_orderbook) => {

    const a = []
    const b = []

    string_orderbook?.a?.forEach(_ask => {
        a.push([Number(_ask[0]), Number(_ask[1])])
    })
    string_orderbook?.b?.forEach(_bid => {
        b.push([Number(_bid[0]), Number(_bid[1])])
    })

    return {
        a, b
    }
}

module.exports = book_transformer
