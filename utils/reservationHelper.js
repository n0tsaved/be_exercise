
function pgFormatDate(date) {
    return new Date(date).toISOString().replace('T',' ').replace('Z','');
}
  
module.exports =  {
  overlappingQuery: (startDate, endDate) => {
    date1 = pgFormatDate(startDate)
    date2 = pgFormatDate(endDate)
    return () => {
      return `("startDate", "endDate") OVERLAPS ('${date1}', '${date2}')`
    }
  },

  checkDateBetween: (date) => {
    date1 = new Date(date)
    date2 = new Date(date)
    date1.setHours(19)
    date1.setMinutes(0)
    date1.setSeconds(0)
    //midnight
    date2.setHours(date1.getHours() + 5)
    console.log(`fun ${date1} and ${date2}`)
    return date1.getTime() < date.getTime() && date.getTime() < date2.getTime()
  },

  getPagination:  (page, size) => {
    const limit = size ? +size : 10
    const offset = page ? page * limit : 0
    
    return { limit, offset }
  }
}