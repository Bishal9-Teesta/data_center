
const ask_inverse = require("./ask_inverse")
const bid_reverse = require("./bid_reverse")
const book_transformer = require("./book_transformer")

function book_maintainer(stored_book, delta_data) {
    let condition = true
    let delta_pointer = 0
    let stored_pointer = 0
    let updated_ask = []
    let updated_bid = []
    let delta_book = {
        a: [],
        b: []
    }

    const transformed_book = book_transformer(delta_data)
    delta_book.a = ask_inverse([...transformed_book.a])
    delta_book.b = bid_reverse([...transformed_book.b])

    const delta_ask_length = delta_book.a.length
    const stored_ask_length = stored_book.a.length
    const delta_bid_length = delta_book.b.length
    const stored_bid_length = stored_book.b.length

    condition = delta_ask_length !== 0 || stored_ask_length !== 0

    // For Ask (Ascending)
    while (condition) {
        let delta_ask_price = 0.0
        let delta_ask_quantity = 0.0
        let stored_ask_price = 0.0
        let stored_ask_quantity = 0.0

        if (delta_pointer < delta_ask_length) {
            [delta_ask_price, delta_ask_quantity] = delta_book.a[delta_pointer]
        }
        if (stored_pointer < stored_ask_length) {
            [stored_ask_price, stored_ask_quantity] = stored_book.a[stored_pointer]
        }

        if (
            stored_ask_price > delta_ask_price &&
            delta_ask_price > 0.0 &&
            delta_ask_quantity > 0.0 &&
            delta_pointer === 0 &&
            stored_pointer === 0
        ) {
            delta_pointer += 1
            updated_ask.push([delta_ask_price, delta_ask_quantity])
        } else if (stored_ask_price === delta_ask_price) {
            delta_pointer += 1
            stored_pointer += 1
            if (delta_ask_quantity > 0.0) {
                updated_ask.push([stored_ask_price, delta_ask_quantity])
            }
        } else if (stored_ask_price < delta_ask_price && stored_ask_price > 0.0) {
            stored_pointer += 1
            updated_ask.push([stored_ask_price, stored_ask_quantity])
        } else if (stored_ask_price > delta_ask_price && delta_ask_price > 0.0) {
            delta_pointer += 1
            if (delta_ask_quantity > 0.0) {
                updated_ask.push([delta_ask_price, delta_ask_quantity])
            }
        } else if (
            delta_pointer === delta_ask_length &&
            stored_ask_price > 0.0 &&
            stored_ask_quantity > 0.0
        ) {
            stored_pointer += 1
            updated_ask.push([stored_ask_price, stored_ask_quantity])
        } else if (
            stored_pointer === stored_ask_length &&
            delta_ask_price > 0.0 &&
            delta_ask_quantity > 0.0
        ) {
            delta_pointer += 1
            updated_ask.push([delta_ask_price, delta_ask_quantity])
        }

        // Condition to iterate
        if (delta_pointer >= delta_ask_length && stored_pointer >= stored_ask_length) {
            condition = false
        }
    }

    condition = delta_bid_length !== 0 || stored_bid_length !== 0
    delta_pointer = 0
    stored_pointer = 0

    // For Bid (Descending)
    while (condition) {
        let delta_bid_price = 0.0
        let delta_bid_quantity = 0.0
        let stored_bid_price = 0.0
        let stored_bid_quantity = 0.0

        if (delta_pointer < delta_bid_length) {
            [delta_bid_price, delta_bid_quantity] = delta_book.b[delta_pointer]
        }
        if (stored_pointer < stored_bid_length) {
            [stored_bid_price, stored_bid_quantity] = stored_book.b[stored_pointer]
        }

        if (
            stored_bid_price < delta_bid_price &&
            delta_bid_price > 0.0 &&
            delta_bid_quantity > 0.0 &&
            delta_pointer === 0 &&
            stored_pointer === 0
        ) {
            delta_pointer += 1
            updated_bid.push([delta_bid_price, delta_bid_quantity])
        } else if (stored_bid_price === delta_bid_price) {
            delta_pointer += 1
            stored_pointer += 1
            if (delta_bid_quantity > 0.0) {
                updated_bid.push([stored_bid_price, delta_bid_quantity])
            }
        } else if (stored_bid_price > delta_bid_price && delta_bid_price > 0.0) {
            stored_pointer += 1
            updated_bid.push([stored_bid_price, stored_bid_quantity])
        } else if (stored_bid_price < delta_bid_price && stored_bid_price > 0.0) {
            delta_pointer += 1
            if (delta_bid_quantity > 0.0) {
                updated_bid.push([delta_bid_price, delta_bid_quantity])
            }
        } else if (
            delta_pointer === delta_bid_length &&
            stored_bid_price > 0.0 &&
            stored_bid_quantity > 0.0
        ) {
            stored_pointer += 1
            updated_bid.push([stored_bid_price, stored_bid_quantity])
        } else if (
            stored_pointer === stored_bid_length &&
            delta_bid_price > 0.0 &&
            delta_bid_quantity > 0.0
        ) {
            delta_pointer += 1
            updated_bid.push([delta_bid_price, delta_bid_quantity])
        }

        // Condition to iterate
        if (delta_pointer === delta_bid_length && stored_pointer === stored_bid_length) {
            condition = false
        }
    }

    return {
        a: updated_ask,
        b: updated_bid,
    }
}

module.exports = book_maintainer
