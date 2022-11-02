const mongoose = require( 'mongoose' );
const dbUrl = process.env.DB_URL;
const connection = mongoose.connect(dbUrl,{

    dbName:process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology:true,
    useCreateIndex: true,
},( err ) => {
        if ( !err ) {
            console.log('Db connection is successfull');
        } else {
            console.log('Db connection failed',err);
        }
})
module.exports ={
    connection
}