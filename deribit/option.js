
const { WebSocket } = require("ws")
const { deribit_socket_base_url } = require("../config")
const book_maker = require("../helper/book_maker")
const get_deribit_contracts = require("../utility/get_deribit_contracts")

const socket_name = "Deribit Option Market Price Socket"
let ping_interval
const option_underlying = process.env.DERIBIT_OPTION_UNDERLYINGS.toString().trim().split(" ") || []
const topics = process.env.DERIBIT_OPTION_TOPIC.toString().trim().split(" ") || []
const all_orderbook = {}

const option_price = async () => {

    const contracts_list = await get_deribit_contracts()
    const socket = new WebSocket(deribit_socket_base_url)

    socket.once("open", () => {
        console.log(`${socket_name} Opened.`)

        ping_interval = setInterval(() => {
            socket.send(JSON.stringify({
                "jsonrpc": "2.0",
                "id": 9,
                "method": "public/set_heartbeat",
                "params": {
                    "interval": 10
                }
            }), _error => {
                if (_error) {
                    console.log(`${socket_name} Pinging Error Name: ${_error.name}`)
                    console.log(`${socket_name} Pinging Error Message: ${_error.message}`)
                    _error.stack && console.log(`${socket_name} Pinging Error Stack: ${_error.stack}`)
                    // } else {
                    //     console.log(`${socket_name} Pinged Successfully.`)
                }
            })
        }, 1000 * 10)

        let index = contracts_list.length / 100
        for (let i = 0; i <= index; i++) {

            let subscribing_param = []
            contracts_list.forEach((_contract_symbol, _index) => {
                if (_index < (i * 100) + 100 && _index > (i * 100)) {
                    subscribing_param.push(`book.${_contract_symbol}.10.20.100ms`)
                }
            })
            // console.log(subscribing_param)

            socket.send(JSON.stringify({
                "jsonrpc": "2.0",
                "method": "public/subscribe",
                "id": 6,
                "params": { "channels": subscribing_param }
            }), _error => {
                if (_error) {
                    console.log(`${socket_name} Subscription Error Name: ${_error.name}`)
                    console.log(`${socket_name} Subscription Error Message: ${_error.message}`)
                    _error.stack && console.log(`${socket_name} Subscription Error Stack: ${_error.stack}`)
                } else {
                    console.log(`${socket_name} Subscribed Successfully.`)
                }
            })
        }
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

        option_price()
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

            if (contracts_list.includes(data?.params?.data?.instrument_name)) {

                const option_contract = data.params.data.instrument_name
                const underlying_index = option_underlying.findIndex(_v => option_contract.includes(_v))
                if (underlying_index > -1) {
                    const topic_to_store = topics.findIndex(_value => _value.includes(option_underlying[underlying_index]))
                    const book_to_store = book_maker({ 
                        a: data.params.data.asks,
                        b: data.params.data.bids
                    })
                    all_orderbook[option_contract] = { a: book_to_store.a, b: book_to_store.b }
                    global.APP_EVENTS.emit("option_price", {
                        topic: topics[topic_to_store],
                        message: all_orderbook
                    })
                }
            }
        } catch (error) {
            console.log(`${socket_name} Data Parsing Error: ${error}`)
        }
    })
}

module.exports = option_price
