import multer from "multer"

const storage= multer.diskStorage({
    destination: function(req, file, cb){
        switch (file.fieldname){
            case "profile-pictures":
                cb(null, "./uploads/profile-pictures");
                break;
            default:
                cb("The fieldname is invalid!", null);
        }
    },

    filename: function(req, file, cb)
    {
        return cb(null, file.originalname)
    }
})

const uploader=multer({storage});
const uploadSingle=(fieldname)=>{
    return uploader.single(fieldname);
}
const uploadMultiple=(fieldsArray)=>{
    return uploader.fields(fieldsArray);
}

export {
    uploadSingle, uploadMultiple
};