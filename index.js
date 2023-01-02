// const fetch = require('node-fetch')
// const axios = require('axios')

class Game{
    constructor(title, store_link, image_url){
      this.title = title
      this.store_link = store_link
      this.image_url = image_url  
    }
}

const get_free_epic_games = async () => {
    const free_games_params = {
        'locale' : 'en-US',
        'country' : 'US',
        'allowCountries' : 'US'
    }

    const epic_api_url = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions"

    // var resp = await axios.get(epic_api_url, params=free_games_params)
    var resp = await fetch(epic_api_url, free_games_params)
    resp = await resp.json()
    // console.log(resp)
    resp = resp.data.Catalog.searchStore.elements
    // console.log(resp[0].promotions.promotionalOffers.length)

    var free_games = []

    for (var game of resp) {
        if (game.promotions && game.promotions.promotionalOffers.length == 0){
            // console.log(game.promotions, 'okkkkkkkkkkkk')
            continue
        } else if (game.promotions){
            var discount_price = game.price.totalPrice.discountPrice

            let promo_start_date = new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].startDate)

            let promo_end_date = new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].endDate)

            // promo_start_date = new Date(promo_start_date)
            // promo_end_date = new Date(promo_end_date)
            // console.log('count',discount_price, promo_end_date,promo_end_date, Date.now() < temp)
            
            if (discount_price == 0 && promo_start_date <= Date.now() <= promo_end_date) {
                try{
                    var image_url = []
                    for (var image of  game.keyImages){
                        if (image.type = 'OfferImageWide'){
                            image_url.push(image)
                        }
                    }
                    free_games.push(
                        new Game(
                            game.title,
                            game.productSlug ? 'https://www.epicgames.com/store/en-US/p/' + game.productSlug : 'https://www.epicgames.com/store/en-US/free-games',
                            image_url[0].url
                        )
                    )
                } catch (error){
                    console.log(error)
                }
            }
        }
    }

    // console.log(free_games)
    return free_games

}

const get_free_steam_games = async () => {
    var free_games = []
    const steam_url = "https://store.steampowered.com/search/?maxprice=free&specials=1"
    // const steam_url = "https://store.steampowered.com/search/?as-hide=cart%2Cea%2Cmixed%2Cnegative&maxprice=free&tags=9%2C19%2C21%2C492%2C597%2C122%2C4182%2C599%2C113&deck_compatibility=2&supportedlang=english&ndl=1"

    var resp = await fetch(steam_url)
    resp = await resp.text()
    let parser = new DOMParser()
    const doc = parser.parseFromString(resp, 'text/html')
    // var games = doc.getElementsByTagName('a').getElementByClassName('search_result_row')
    var games = doc.querySelectorAll('.search_result_row')
    // console.log(games)

    for (var game of games) {
        var game_name_class = game.querySelector('.title')
        var game_name = game_name_class.textContent
        var game_url = game['href']
        var game_id = game.getAttribute('data-ds-appid')
        var image_url = "https://cdn.cloudflare.steamstatic.com/steam/apps/"+ String(game_id) +"/header.jpg"
        
        free_games.push(
            new Game(game_name,game_url,image_url)
        )
        // console.log(game.getAttribute('data-ds-appid'))
        // console.log(game_url)
    }

    return free_games
    // var el = document.createElement('html')
    // el.innerHTML = resp
    // console.log(resp,typeof(resp))

}


const main = async () => {

    var games_epic = await get_free_epic_games()
    var games_steam = await get_free_steam_games()

    var games = games_epic.concat(games_steam)
    // console.log(...games)
    // console.log(games)
    const root = document.getElementById('root')
    for (var game of games){
        var div = document.createElement('div')
        var img = document.createElement('img')
        img.src = await game.image_url
        // img.height = 400
        img.width = 400
        img.style.borderStyle = 'double'
        var a = document.createElement('a')
        a.href = await game.store_link
        a.appendChild(img)
        a.target = '_blank'
        div.appendChild(a)


        a = document.createElement('a')
        a.innerText = await game.title
        a.href = await game.store_link
        a.target = '_blank'
        a.style.fontWeight = 1000
        a.style.fontSize = 'large'

        // console.log('akjflskfj',game.image_url.url, 'alkjdfksjf', game.store_link, 'dkafafjhajsfhjshdfj')

        div.appendChild(a)
        div.classList.add('item')
        div.style.display = 'grid'
        div.style.justifyItems = 'center'
        div.style.margin = 80
        div.style.borderStyle = 'double'
        root.appendChild(div)

    }
    // document.getElementById('root').innerHTML = games[0].title
    // document.getElementById('item1').innerHTML = "test1"

}

main() 

// get_free_steam_games()