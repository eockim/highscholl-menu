'use strict';
class TodayUtil{

    constructor(){
        this.today = new Date();
    }

    getYearStr(){
        return this.today.getFullYear();
    }

    getMonthStr(){
        return this.today.getMonth() + 1 < 10 ? '0' + (this.today.getMonth() * 1 + 1) : this.today.getMonth();
    }

    getDateStr(){
        return this.today.getDate() + 1 < 10 ? '0' + (this.today.getDate() * 1) : this.today.getDate();
    }

    getFullStr(){
        
        
        return getYearStr() + '.' + getMonthStr() + '.' + getDateStr();
        
    }

    getRemainSeconds(){
        return 24 * 60 * 60 - (this.today.getHours() * 60 * 60) + (this.today.getMinutes() * 60) + this.today.getSeconds();
    }

}

module.exports = new TodayUtil();

