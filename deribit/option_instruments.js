
const { deribit_rest_instance } = require("../config")

const option_instruments = async (currency) => {

    let response
    const url = `public/get_instruments?currency=${currency}&expired=false&kind=option`

    await deribit_rest_instance
        .get(url)
        .then(_response => {
            response = _response.data
        })
        .catch(_error => {
            const message = _error?.response?.data?.error?.message ? _error.response.data.error.message : _error.message
            console.log("Deribit Option Instruments Error: ", message)
        })

    return response
}

module.exports = option_instruments
