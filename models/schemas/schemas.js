/*********************************************************************************************************
*	Schemas.js : schemas handler for main instances and collections.
*   Author: Constant Pagoui.
*	Date: 03-01-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

const mongoose = require("mongoose");

exports.getUserSchema = function(){

    const userSchema = new mongoose.Schema({
        firstName:{
            type: String,
            required: true,
            min: 3,
            max: 45
        },
        lastName:{
            type: String,
            min: 2,
            max: 45
        },
        email:{
            type: String,
        },
        username:String,
        phone:{
            type: String,
            min: 7,
            max: 15
        },
        address:{
            type: String,
            required: false
        },
        createdAt:{
            type: Date,
            required: true
        },
        lastUpdate:{
            type: Date,
            required: true
        },
        payments:{
            type: String,
            created_at: Date
        }
    
    });

    userSchema.plugin(require("passport-local-mongoose"));
    userSchema.plugin(require("mongoose-findorcreate"));
    return userSchema;
}

exports.getProviderSchema = function(){
    
    const providerSchema = new mongoose.Schema({
        companyName:{
                type: String,
                min:3
            },
            firstName:{
                type: String,
                required: true,
                min: 3,
                max: 45
            },
            lastName:{
                type: String,
                required: true,
                min: 2,
                max: 45
            },
            email:{
                type: String,
                required: true
            },
            phone:{
                type: String,
                required: true,
                min: 7,
                max: 15
            },
            address:{
                type: String,
                required: false
            },
            createdAt:{
                type: Date,
                required: true
            },
            lastUpdate:{
                type: Date,
                required: true
            },
            payments:{
                type: String,
                created_at: Date
            }
        
        });
    
        providerSchema.plugin(require("passport-local-mongoose"));
        providerSchema.plugin(require("mongoose-findorcreate"));
        return providerSchema;
}

exports.getCategorySchema = function(){

    const categorySchema = new mongoose.Schema({
        name:{
            type: String,
            unique: true,
            min:3
        },
        description:{
            type: String,
            required: true,
            min: 3,
            max: 45
        },
        icon:{
            type: String
        },
        createdAt:{
            type: Date,
            required: true
        },
        lastUpdate:{
            type: Date,
            required: true
        },
    
    });

    categorySchema.plugin(require("passport-local-mongoose"));
    categorySchema.plugin(require("mongoose-findorcreate"));
    return categorySchema;
}

exports.getCountrySchema = function(){

    const countrySchema = new mongoose.Schema({
        name:{
            type: String,
            unique: true,
            min:3
        },
        phone_code: String,
        currency_name: String,
        currency_symbol: String,
        capital: String, 
        region: String,
        subregion: String,
        latitude: Number,
        longitude: Number,
    
    });

    countrySchema.plugin(require("passport-local-mongoose"));
    countrySchema.plugin(require("mongoose-findorcreate"));
    return countrySchema;
}

exports.getCitySchema = function(){

    const citySchema = new mongoose.Schema({
        name:{
            type: String,
            unique: true,
            min:3
        },
        state_code: String,
        state_name: {
            type: String,
            required: true
        },
        country_code: String,
        country_name: {
            type:String,
            required: true
        },
        latitude: Number,
        longitude: Number,
    
    });

    citySchema.plugin(require("passport-local-mongoose"));
    citySchema.plugin(require("mongoose-findorcreate"));
    return citySchema;
}

exports.getStateSchema = function(){

    const stateSchema = new mongoose.Schema({
        name:{
            type: String,
            unique: true,
            min:3
        },
        state_code:{
            type: String,
            required: true
        },
        country_code: String,
        country_name: {
            type:String,
            required: true
        },
        latitude: Number,
        longitude: Number,
    
    });

    stateSchema.plugin(require("passport-local-mongoose"));
    stateSchema.plugin(require("mongoose-findorcreate"));
    return stateSchema;
}