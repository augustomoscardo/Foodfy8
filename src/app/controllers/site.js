const Chef = require('../models/Chef')
const Recipe = require('../models/Recipe')
const File = require('../models/File')
const RecipeFile = require('../models/RecipeFile')

module.exports = {
    async home(req, res) {

        try {
            const recipesResults = await Recipe.all()
            const recipes = recipesResults.rows

            if (!recipes) return res.send('Recipes not found!')

            async function getImage(recipe_id) {
                const fileResults = await RecipeFile.findRecipeId(recipe_id)   
                const fileId = fileResults.rows[0].file_id
                const imageResults = await File.find(fileId)
                const image = imageResults.rows.map(image => `${req.protocol}://${req.headers.host}${image.path.replace("public", "")}`)

                return image[0]
            }

            const recipesPromise = recipes.map(async recipe => {
                recipe.image = await getImage(recipe.id)

                return recipe
            })

            const lastAdded = await Promise.all(recipesPromise)
                    
            return res.render('site/home', { recipes: lastAdded })

        } catch (error) {
            console.error(error);
        } 
    },
    about(req, res) {
        
        try {
            
            return res.render('site/about')
            
        } catch (error) {
            console.error(error);
        }  
    },
    async recipes(req, res) {
        
        try {
            const recipesResults = await Recipe.all()
            const recipes = recipesResults.rows

            if (!recipes) return res.send('Recipes not found!')

            async function getImage(recipe_id) {
                const fileResults = await RecipeFile.findRecipeId(recipe_id)   
                const fileId = fileResults.rows[0].file_id
                const imageResults = await File.find(fileId)
                const image = imageResults.rows.map(image => `${req.protocol}://${req.headers.host}${image.path.replace("public", "")}`)

                return image[0]
            }

            const recipesPromise = recipes.map(async recipe => {
                recipe.image = await getImage(recipe.id)

                return recipe
            })

            const lastAdded = await Promise.all(recipesPromise)
            
            return res.render('site/recipes', { recipes: lastAdded })

        } catch (error) {
            console.error(error);
        }   
    },
    async recipe(req, res) {
    
        try {
            const recipeResults = await Recipe.find(req.params.id)
            const recipe = recipeResults.rows[0]

            if (!recipe) return res.send('Recipe not found!')

            // get images
            const results = await RecipeFile.findRecipeId(req.params.id)
            const recipeFilesPromise = await Promise.all(results.rows.map(file => File.find(file.file_id)))

            let recipeFiles = recipeFilesPromise.map(result => result.rows[0])
            recipeFiles = recipeFiles.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }))

            return res.render('site/recipe', { recipe, recipeFiles })

        } catch (error) {
            console.error(error);
        }   
    },
    async searchResult(req, res) {

        try {
            const { filter } = req.query

            let recipesResults,
                params = {};

            if (!filter) return res.redirect("/home")

            params.filter = filter

            recipesResults = await Recipe.search(params)
            const recipes = recipesResults.rows
            if (!recipes) return res.send('Recipes not found!')

            async function getImage(recipe_id) {
                const fileResults = await RecipeFile.findRecipeId(recipe_id)   
                const fileId = fileResults.rows[0].file_id
                const imageResults = await File.find(fileId)
                const image = imageResults.rows.map(image => `${req.protocol}://${req.headers.host}${image.path.replace("public", "")}`)

                return image[0]
            }

            const recipesPromise = recipes.map(async recipe => {
                recipe.image = await getImage(recipe.id)

                return recipe
            })
    
            const lastAdded = await Promise.all(recipesPromise)

            return res.render('site/searchResult', { recipes: lastAdded, filter })
            
        } catch (error) {
            console.error(error);
        }  
    },
    async chefs(req, res) {
        const { filter } = req.query

        try {
            // show chefs
            const chefsResults = await Chef.all()
            const chefs = chefsResults.rows

            const chefWithImage = await Promise.all(chefs.map( async chef => {
            const fileResults = await Chef.find(chef.id) // trazendo os chefs
            const fileId = fileResults.rows[0].file_id // pegando o id da imagem dentro de chef
            const imageResults = await File.find(fileId) // trazendo as imagens 
            const image = imageResults.rows[0].path // acessando a propriedade path das imagens
            const chefCountRecipes = fileResults.rows[0].total_recipes // pegando a qtd de receitas
            
            return {
                ...chef,
                image: `${req.protocol}://${req.headers.host}${image.replace("public", "")}`,
                count: chefCountRecipes
            }
            }))

            return res.render('site/chefs', { chefs: chefWithImage })
                    
            
        } catch (error) {
            console.error(error);
        }  
    },
}