const mysql = require('mysql');
let instance = null;

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "wakati"
});

connection.connect(err => {
    let message = !err ? 'Connecté' : 'Erreur de connexion';
    console.log(`mysql: ${message}`);
});

class Connect {
    static getDbServiceInstance() {
        return instance ? instance : new Connect();
    }

    async getNonAccomplishedGoals(email_user) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM goals where accomplished=0 AND email_user=?;";

                connection.query(query, email_user, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            // console.log(response);
            return response;
        } catch (error) {
            console.log("Problème au niveau de getNonAccomplishedGoals"+error);
        }
    }

    async getAccomplishedGoals(email_user) {
    try {
        const response = await new Promise((resolve, reject) => {
            const query = "SELECT id_goal, goal FROM goals where accomplished=1 AND email_user=?;";

            connection.query(query, email_user, (err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            })
        });
        // console.log(response);
        return response;
    } catch (error) {
        console.log("Problème au niveau de getAccomplishedGoals"+error);
        }
    }

    async getGoalsForPartner (email_user) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM goals where accomplished=0 AND email_partner=?;";
                connection.query(query, email_user, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            // console.log(response);
            return response;
        } catch (error) {
            console.log("Problème au niveau de getGoalsForPartner"+error);
            }

    }

    async deleteRowById(id) {
        try {
            id = parseInt(id,10);
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM goals WHERE id_goal = ?";
                connection.query(query,id, (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                });
            });
    
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateAccomplishment(id){
        try {
        id = parseInt(id,10);
            const response = await new Promise((resolve, reject) => {
                const query = "UPDATE goals SET accomplished = 1 WHERE id_goal = ?";
                connection.query(query, id, (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                });
            });
    
            return response;
        } catch (error) {
            console.log(error);
            return false;
        }
        }

    async insertNewGoal(email_user,goal,date_goal,partner,email_partner) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                var sql_query = `INSERT INTO goals (email_user, goal, date_goal, partner, email_partner) VALUES (?, ?, ?, ?, ?)`;        
                connection.query(sql_query, [email_user,goal,date_goal,partner,email_partner], function (err, result) {
                    if (err) reject(new Error(err.message));
                    resolve(result.insertId); 
                });
            });
            return {
                id_goal : insertId,
                email_user : email_user,
                goal : goal,
                date_goal : date_goal,
                partner : partner,
                email_partner : email_partner
            };
        } catch (error) {
            console.log(error);
        }
    }

   async getCitations() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT citation, author FROM citations";
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            // console.log(response);
            return response;
        } catch (error) {
            console.log("Problème au niveau de la génération de citations"+error);
            }
        }
    
    async getOneGoal (id) {
        id = parseInt(id, 10);
        const response = await new Promise((resolve, reject) => {
            const query = "SELECT * from goals where id_goal=?";
            connection.query(query,id,(err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            })
        });
        return response;
    } catch (error) {
        console.log(error);
    }
    

    } 
    

    
module.exports = Connect; 