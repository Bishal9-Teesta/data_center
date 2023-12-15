
const { WebSocket } = require("ws")
const { delta_socket_base_url } = require("../config")
const book_transformer = require("../helper/book_transformer")
const book_maintainer = require("../helper/book_maintainer")

const socket_name = "Delta Future Market Price Socket"
let ping_interval
const future_symbols = process.env.DELTA_FUTURE_SYMBOLS.toString().trim().split(" ") || []
const topics = process.env?.DELTA_FUTURE_TOPIC?.toString().trim().split(" ") || []

let all_books = {}

const future_price = () => {

    const socket = new WebSocket(delta_socket_base_url)

    socket.once("open", () => {
        console.log(`${socket_name} Opened.`)

        ping_interval = setInterval(() => {
            socket.send(JSON.stringify({
                "type": "ping"
            })), _error => {
                if (_error) {
                    console.log(`${socket_name} Pinging Error Name: ${_error.name}`)
                    console.log(`${socket_name} Pinging Error Message: ${_error.message}`)
                    _error.stack && console.log(`${socket_name} Pinging Error Stack: ${_error.stack}`)
                } else {
                    console.log(`${socket_name} Pinged Successfully.`)
                }
            }
        }, 1000 * 10)

        socket.send(JSON.stringify({
            "type": "subscribe",
            "payload": {
                "channels": [
                    {
                        "name": "l2_updates",
                        "symbols": future_symbols
                    }
                ]
            }
        }), _error => {
            if (_error) {
                console.log(`${socket_name} Subscription Error Name: ${_error.name}`)
                console.log(`${socket_name} Subscription Error Message: ${_error.message}`)
                _error.stack && console.log(`${socket_name} Subscription Error Stack: ${_error.stack}`)
            } else {
                console.log(`${socket_name} Subscribed Successfully.`)
            }
        })
    })
    socket.once("error", (_error) => {
        console.log(`${socket_name} Error Name: ${_error.name}`)
        console.log(`${socket_name} Error Message: ${_error.message}`)
        _error.stack && console.log(`${socket_name} Error Stack: ${_error.stack}`)

        socket.close(1000, `${socket_name} closing due to error.`)
    })
    socket.once("close", (_code, _reason) => {
        console.log(`${socket_name} Close Code: ${_code}`)
        console.log(`${socket_name} Close Reason: ${Buffer.from(_reason).toString()}`)

        socket.removeAllListeners("ping")
        socket.removeAllListeners("pong")
        socket.removeAllListeners("unexpected-response")
        socket.removeAllListeners("upgrade")
        socket.removeAllListeners("message")

        clearInterval(ping_interval)
        ping_interval = undefined

        future_price()
    })
    socket.on("ping", (_data) => {
        console.log(`${socket_name} Ping Data: ${Buffer.from(_data).toString()}`)
    })
    socket.on("pong", (_data) => {
        console.log(`${socket_name} Pong Data: ${Buffer.from(_data).toString()}`)
    })
    socket.on("unexpected-response", (_request, _response) => {
        console.log(`${socket_name} Unexpected Response Status Code: ${_response.statusCode}`)
        console.log(`${socket_name} Unexpected Response Status Message: ${_response.statusMessage}`)
    })
    socket.on("upgrade", (_request) => {
        console.log(`${socket_name} Upgrade Request Status Code: ${_request.statusCode}`)
        console.log(`${socket_name} Upgrade Request Status Message: ${_request.statusMessage}`)
    })
    socket.on("message", (_data, _is_binary) => {
        // console.log(`${socket_name} Message Data: ${Buffer.from(_data).toString()}`)
        // console.log(`${socket_name} Message Is Binary: ${_is_binary}`)

        try {
            const data = JSON.parse(Buffer.from(_data).toString())

            if (future_symbols.includes(data?.symbol)) {

                const future_symbol = data.symbol
                const topic_to_store = topics.findIndex(_value => _value.includes(future_symbol))

                if (topic_to_store > -1) {

                    if (data.action === "snapshot") {

                        const book_to_store = book_transformer({ a: data.asks, b: data.bids })
                        all_books[future_symbol] = book_to_store
                        global.APP_EVENTS.emit("future_price", {
                            topic: topics[topic_to_store],
                            message: book_to_store
                        })
                    } else if (data.action === "update") {

                        const book_to_store = book_maintainer(all_books[future_symbol], { a: data.asks, b: data.bids })
                        all_books[future_symbol] = book_to_store
                        global.APP_EVENTS.emit("future_price", {
                            topic: topics[topic_to_store],
                            message: book_to_store
                        })
                    } else if (data.action === "error") {
                        
                        socket.close(1000, `${socket_name} closing due to an error from Socket Server team regarding data.`)
                    }
                }
            }
        } catch (error) {
            console.log(`${socket_name} Data Parsing Error: ${error}`)
        }
    })
}

module.exports = future_price
