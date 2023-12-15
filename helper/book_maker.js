
const book_maker = (orderbook) => {

    const asks = []
        const bids = []

    orderbook?.a?.forEach(_ask => {
        asks.push([Number(_ask[0], Number(_ask[0]) / Number(_ask[1]))])
    })
    orderbook?.b?.forEach(_bid => {
        bids.push([Number(_bid[0], Number(_bid[0]) / Number(_bid[1]))])
    })

    return {
        a: asks, b: bids
    }
}

module.exports = book_maker
