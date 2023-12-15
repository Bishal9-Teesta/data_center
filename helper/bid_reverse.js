
const bid_reverse = (bids) => {
    bids.sort((first, second) => {
        return second[0] - first[0]
    })

    return bids
}

module.exports = bid_reverse
