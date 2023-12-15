
const deribit_option_instruments = require("../deribit/option_instruments")

const get_deribit_contracts = async () => {

    const option_contract = []
    const options_underlying = process.env.DERIBIT_OPTION_UNDERLYINGS.toString().trim().split(" ") || []

    for (const underlying_index in options_underlying) {
        const option_instruments_data = await deribit_option_instruments(options_underlying[underlying_index])

        option_instruments_data?.result?.length > 0 && option_instruments_data.result.forEach(_asset => {

            // console.log("Deribit Option Contract: ", _asset.instrument_name)
            option_contract.push(_asset.instrument_name)
        })
    }

    return option_contract
}

module.exports = get_deribit_contracts
