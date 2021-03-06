var Dashboard = Vue.component("Dashboard", {
  template: `
      <div v-if='Loged'>
        <div class="container">
          <h1 class="text-center">ESPACE GESTION DES POKEMON</h1>
          <h2>OPTIONS :</h2>
          <div class="row align-items-start">
              <div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <a>
                  <router-link class="nav-link noborderalink" to="/addPokemon">
                    <div class="box-part text-center">
                        <img class="HomeImg col-lg-8 col-md-8 col-sm-8 col-xs-12" src="../../img/add_poke.png" alt="img to add pokemon">
                    </div>
                  </router-link> 
                </a>
              </div>	
              <div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <a>
                  <router-link class="nav-link noborderalink" to="/addRealPokemon">
                    <div class="box-part text-center">
                        <img class="HomeImg col-lg-8 col-md-8 col-sm-8 col-xs-12" src="../../img/supr_poke.png" alt="img to delete pokemon">
                    </div>
                  </router-link>
                </a>
              </div>	
              <h2>MES POKEMON :</h2>
              <h1>{{Fail}}</h1>
              <div class="col-lg-4 col-md-4 col-sm-4 col-xs-12 box-part Pokemonheight text-center center-block" v-for="pokemon in PokemonList">
                <img class='col-lg-8 col-md-8 col-sm-8 col-xs-12 pokemonImage ImageRounded SpaceBottom' :src="pokemon.Image"/>
                <h3>{{pokemon.Nom}}</h3>
                <h3>Type du pokemon: {{pokemon.Type}}</h3>
                <h3>Etape d'évolution: {{pokemon.EvolutionStep}}</h3>
                <div class="d-flex justify-content-center mt-3 row align-items-start">
                    <button type="button" name="button" class="btn btn-info SpaceAround col-lg-4 col-md-6 col-sm-12 col-xs-12" @click="PokemonDetail(pokemon.ID)">Détail</button>
                    <button type="button" name="button" class="btn btn-success SpaceAround col-lg-4 col-md-6 col-sm-12 col-xs-12" @click="PokemonCopy(pokemon.ID)">copier</button>
                    <button type="button" name="button" class="btn btn-danger SpaceAround col-lg-4 col-md-6 col-sm-12 col-xs-12" @click="PokemonDelete(pokemon.ID)">supprimer</button>
                </div>
                <div class="d-flex justify-content-center mt-3 row align-items-start">
                  <div class="form-check form-switch SpaceAround col-lg-4 col-md-6 col-sm-12 col-xs-12">
                      <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" @click="PokemonCompareList(pokemon)" :disabled="CompareList.length == 2 && !CompareList.includes(pokemon)">
                      <label class="form-check-label" for="flexSwitchCheckDefault">Comparer</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
            <div class="Comparaison_window" v-if='IsCompare'>
              <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 box-part text-center">
                <h3 class="SpaceAround">COMPARER</h3>
                <div class="SpaceTop" v-for="pokemon in CompareList">
                    <h3>{{pokemon.Nom}}</h3>
                </div>
                <button type="button" name="button" class="btn btn-info SpaceTop col-lg-10 col-md-10 col-sm-10 col-xs-10" @click="PokemonCompare()" :disabled="CompareList.length != 2">Comparer</button>
              </div>
            </div>
        </div>
      </div>
      <Accueil v-else></Accueil>
    `,
  data() {
    return {
      Loged: isToken(),
      token: getToken(),
      user: getId(),
      IsCompare: false,
      NbCompare: 0,
      CompareList: [],
      PokemonList: [],
      IdTypeList: [],
      IdPokemon: null,
      Fail: null,
    };
  },
  async mounted() {
    if (this.Loged) {
      await axios({
          method: "put",
          url: "api/pokemon/list",
          headers: {
            Authorization: `Bearer ${this.token} ${this.user}`,
          },
        })
        .then((response) => {
          this.PokemonList = response.data.result;
          if(this.PokemonList.length == 0){this.Fail='Veuillez ajouter votre premier Pokemon'}
        })
        .catch((error) => {
          if(error.response.status == 401 && (error.response.data == 'Invalid user ID' || error.response.data == 'Token invalid' )){
            clearToken();
            swal("","vous avez été déconnecté, votre session a expiré, veuillez vous reconnecter","error")
            .then(() => {
            this.$router.go();
            });
            };
          if(error.response.status == 500){
          swal("","Les pokemon n'ont pas pu etre récupré","error");
          }
        });
    }
  },
  methods: {
    PokemonDetail(ID) {
      this.$router.push({ path: "/details", query: { ID: ID } });
    },
    async PokemonCopy(ID) {
      this.IdPokemon = ID;
      await swal({
        title: "Etes vous sur?",
        text: "Etes vous sûr de vouloir copier ce pokemon ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((Pokemon) => {
        if(Pokemon){
          axios({
            method: "patch",
            url: "api/pokemon/this/copy",
            headers: {
              Authorization: `Bearer ${this.token} ${this.user}`,
            },
            data: {
              IdPokemon: this.IdPokemon,
            },
          })
          .then((response) => {
            swal("","Pokemon copié","success")
            .then(() => {
            this.Noms=response.data.results;
            this.$router.go();
            });
          })
          .catch((error) => {
            if(error.response.status == 401 && (error.response.data == 'Invalid user ID' || error.response.data == 'Token invalid' )){
              clearToken();
              swal("","vous avez été déconnecté, votre session a expiré, veuillez vous reconnecter","error")
            .then(() => {
              this.$router.go();
            });
              };
            swal("","Le pokemon n'a pas pu etre copié","error");
          });
        } else {
          swal("","Le pokemon n'a pas été copié","error");
        }
      });
    },
    async PokemonDelete(ID) {
      this.IdPokemon = ID;
      await swal({
        title: "Etes vous sur?",
        text: "Etes vous sûr de vouloir supprimer ce pokemon ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((Pokemon) => {
        if(Pokemon){
          axios({
            method: "delete",
            url: "api/pokemon/this/delete",
            headers: {
              Authorization: `Bearer ${this.token} ${this.user}`,
            },
            data: {
              IdPokemon: this.IdPokemon,
            },
          })
          .then(() => {
            swal("","Pokemon supprimé","success")
            .then(() => {
              this.$router.go();
            });
          })
          .catch(() => {
            if(error.response.status == 401 && (error.response.data == 'Invalid user ID' || error.response.data == 'Token invalid' )){
              clearToken();
              swal("","vous avez été déconnecté, votre session a expiré, veuillez vous reconnecter","error")
              .then(() => {
                this.$router.go();
              });
              };
            swal("","Le pokemon n'a pas pu etre supprimé","error");
          });
        } else {
          swal("","Le pokemon n'est pas supprimé","error");
        }
      });
    },
    async PokemonCompareList(ID) {
      var list = this.CompareList;
      if (!list.includes(ID)) {
        list.push(ID);
        this.IsCompare = true;
      } else {
        const index = list.indexOf(ID);
        if (index > -1) {
          list.splice(index, 1);
        }
      }
      if (list.length == 0) {
        this.IsCompare = false;
      }
    },
    async PokemonCompare() {
        await axios({
          method: "put",
          url: "api/pokemon/details/findById",
          headers: {
            Authorization: `Bearer ${this.token} ${this.user}`,
          },
          data: {
            IdPokemon: this.CompareList[0].ID,
          },
        })
        .then((response) => {
          this.CompareList.splice(0, 1,response.data.result[0]);
          })
          .catch((error) => {
            if(error.response.status == 401 && (error.response.data == 'Invalid user ID' || error.response.data == 'Token invalid' )){
              clearToken();
              swal("","vous avez été déconnecté, votre session a expiré, veuillez vous reconnecter","error")
              .then(() => {
                this.$router.go();
              });
              };
              swal("","Les pokemons n'ont pas pu etre comparer","error");
          });
        if (this.CompareList[0].EvolutionStep == "non") {
          this.CompareList[0].EvolutionStep =
            "unique, Il n'y a pas d'évolution";
        }
        await axios({
          method: "put",
          url: "api/pokemon/details/findById",
          headers: {
            Authorization: `Bearer ${this.token} ${this.user}`,
          },
          data: {
            IdPokemon: this.CompareList[1].ID,
          },
        })
        .then((response2) => {
          this.CompareList.splice(1, 1,response2.data.result[0]);
          })
          .catch((error) => {
            if(error.response.status == 401 && (error.response.data == 'Invalid user ID' || error.response.data == 'Token invalid' )){
              clearToken();
              swal("","vous avez été déconnecté, votre session a expiré, veuillez vous reconnecter","error")
              .then(() => {
                this.$router.go();
              });
              };
          swal("","Les pokemons n'ont pas pu etre comparer","error");
          });
        if (this.CompareList[1].EvolutionStep == "non") {
          this.CompareList[1].EvolutionStep =
            "unique, Il n'y a pas d'évolution";
        }
      this.$router.push({ path: "/compare", query: { CompareList: this.CompareList } });
    },
  },
});
