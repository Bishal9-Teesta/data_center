
require("dotenv").config()
const { kafka_instance } = require("./config")

const topics = process.env?.KAFKA_TOPIC?.toString().trim().split(" ") || []

const delete_topic = async () => {

    const admin = kafka_instance.admin()

    await admin.connect()

    await admin
        .deleteTopics({ topics })
        .then(_value => console.log("Successfully deleted all topics."))
        .catch(_error => console.log("Deleting Topics Error: ", _error))
        .finally(async () => await admin.disconnect())
}
delete_topic()
