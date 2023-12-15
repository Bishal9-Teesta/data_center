
require("dotenv").config()
const { kafka_instance } = require("./config")

const future_topics = process.env?.KAFKA_FUTURE_TOPIC?.toString().trim().split(" ") || []
const option_topics = process.env?.KAFKA_OPTION_TOPIC?.toString().trim().split(" ") || []

const topics = [...future_topics, ...option_topics]

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
