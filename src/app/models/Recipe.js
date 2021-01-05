const { date } = require('../../lib/utils')

const db = require('../../config/db')

module.exports = {
    all() {
        return db.query(`
            SELECT recipes.*, chefs.name AS chef_name 
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            ORDER BY created_at DESC
        `)
    },
    create(data) {
        const query = `
            INSERT INTO recipes (
                chef_id,
                title,
                ingredients,
                preparation,
                information,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `

        const values = [
            data.chef,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            date(Date.now()).iso
        ]

        return db.query(query, values)
    },
    find(id) {
        return db.query(`
            SELECT recipes.*, chefs.name AS chef_name 
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id) 
            WHERE recipes.id = $1`, [id])
    },
    findBy(filter) {
        return db.query(`
            SELECT recipes.*, chefs.name AS chef_name
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            WHERE recipes.title ILIKE '%${filter}%'
            OR chefs.name ILIKE '%${filter}%'
            GROUP BY recipes.id, chefs.name
            ORDER BY updated_at DESC
            `)
    },
    update(data) {
        const query = `
            UPDATE recipes SET
                chef_id=($1),
                title=($2),
                ingredients=($3),
                preparation=($4),
                information=($5)
            WHERE id = $6
        `

        const values = [
            data.chef,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            data.id
        ]

        return db.query(query, values,)
    },
    delete(id) {
        try {
            /*const results = await db.query(`
                SELECT * FROM files
                LEFT JOIN recipe_files ON (files.id = recipe_files.file_id)
                WHERE recipe_files.recipe_id = $1
            `, [id])
            
            const removedFiles = results.rows.map(async file => {
                fs.unlinkSync(file.path)  
                
                await db.query(`DELETE FROM recipe_files WHERE recipe_files.file_id = $1`, [file.file_id])
                await db.query(`DELETE FROM files WHERE id = $1`, [file.file_id])
            })*/
    
            return db.query(`DELETE FROM recipes WHERE id = $1`, [id])
            
        } catch (error) {
          console.error(error);  
        }
    },
    chefsSelectOptions() {
        return db.query(`
            SELECT name, id FROM chefs
            ORDER BY chefs.name`)
    },
    files(id) {
        return db.query(`SELECT * FROM files WHERE id = $1`, [id])
    },
    search(params) {
        const { filter } = params

        let query = "",
            filterquery = `WHERE`

        filterquery = `${filterquery}
            recipes.title ILIKE '%${filter}%'
            OR chefs.name ILIKE '%${filter}%'
        `

        query = `
            SELECT recipes.*, chefs.name AS chef_name
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            ${filterquery}
        `
        
        return db.query(query)
    }
}