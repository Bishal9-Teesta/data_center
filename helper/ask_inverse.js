
const ask_inverse = (asks) => {
    asks.sort((first, second) => {
        return first[0] - second[0]
    })

    return asks
}

module.exports = ask_inverse
