module.exports.createErrorMessage =(message,errorcode=400)=>{

    return {
        error:{
            errorcode:errorcode,
            message:message
        }
    }
}