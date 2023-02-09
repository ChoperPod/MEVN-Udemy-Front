<template>
    <div class="container">
        <b-alert :show="dismissCountDown" dismissible :variant="mensaje.color" @dismissed="dismissCountDown = 0"
            @dismiss-count-down="countDownChanged">
            {{ mensaje.texto }}
        </b-alert>

        <form @submit.prevent="editarNota(notaEditar)" v-if="editar">
            <h3>Modificar nota</h3>
            <input type="text" class="form-control my-2" placeholder="Nombre" v-model="notaEditar.nombre">
            <input type="text" class="form-control my-2" placeholder="Descripcion" v-model="notaEditar.descripcion">
            <button class="btn btn-outline-warning my-2 me-2" type="submit">Guardar cambios</button>
            <button class="btn btn-outline-secondary my-2" @click="editar = false">Cancelar</button>
        </form>

        <form @submit.prevent="agregarNota()" v-if="!editar">
            <h3>Agregar nueva nota</h3>
            <input type="text" class="form-control my-2" placeholder="Nombre" v-model="nota.nombre">
            <input type="text" class="form-control my-2" placeholder="Descripcion" v-model="nota.descripcion">
            <button class="btn btn-outline-success my-2" type="submit">Agregar</button>
        </form>

        <table class="table mt-5">
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Descripcion</th>
                    <!-- <th scope="col">Fecha</th> -->
                    <th scope="col">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in notas" :key="index">
                    <th scope="row">{{ item._id }}</th>
                    <td>{{ item.nombre }}</td>
                    <td>{{ item.descripcion }}</td>
                    <!-- <td>{{ item.date }}</td> -->
                    <td>
                        <!-- <button class="btn btn-outline-warning me-2" @click="alerta">Alerta</button> -->
                        <button class="btn btn-outline-warning me-2" @click="activarEdicion(item._id)">Editar</button>
                        <button class="btn btn-outline-danger" @click="eliminarNota(item._id)">Eliminar</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <!-- <p>{{cantidadPaginas}}</p> -->
        <!--  -----------------------PAGINADOR----------------- -->
        <p>{{ pagActual }}</p>
        <nav aria-label="Page navigation example">
            <ul class="pagination">
                <li class="page-item" :class="{'disabled': pagActual === 1}">
                    <router-link :to="{ query: { pagina: pagActual - 1 } }" class="page-link"
                        href="#">Previous</router-link>
                </li>
                <li class="page-item" :class="{ 'active': pagActual === index + 1 }"
                    v-for="(item, index) in cantidadPaginas" :key="index">
                    <router-link :to="{ query: { pagina: index + 1 } }" class="page-link" href="#">{{ index + 1
                    }}</router-link>
                </li>
                <li class="page-item" :class="{'disabled': pagActual === cantidadPaginas}">
                    <router-link :to="{ query: { pagina: pagActual + 1 } }" class="page-link" href="#">Next</router-link>
                </li>
            </ul>
        </nav>
        <!-- ------------ Fin Paginador -------------- -->
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
export default {
    data() {
        return {
            totalNotas: .0,
            limite: 5,
            pagActual: 1,
            notas: [],
            dismissSecs: 2,
            dismissCountDown: 0,
            mensaje: { color: '', texto: '' },
            nota: { nombre: '', descripcion: '' },
            editar: false,
            notaEditar: { nombre: '', descripcion: '' },
        }
    },
    // created() {
    //     this.listarNotas()
    //     // this.getTareas()
    // },

    computed: {
        ...mapState(['token']),
        cantidadPaginas() {
            return Math.ceil(this.totalNotas / this.limite)
        }
    },
    watch: {
        "$route.query.pagina": {
            immediate: true,
            handler(pagina) {
                pagina = parseInt(pagina) || 1;
                this.paginacion(pagina);
                this.pagActual = pagina;
            }
        }
    },
    methods: {
        // alerta() {
        //     console.log('Alerta!!!')
        //     this.mensaje.color = 'warning'
        //     this.mensaje.texto = 'Probando la alerta'
        //     this.showAlert();
        // },
        listarNotas() {
            const config = {
                headers: {
                    token: this.token
                }
            }
            this.axios.get('/nota', config)
                .then(res => {
                    console.log(res.data.notaDB)
                    this.notas = res.data.notaDB
                })
                .catch(e => {
                    console.log(e.response)
                })
        },

        // Listar Notas Paginadas
        paginacion(pagina) {
            const config = {
                headers: {
                    token: this.token
                }
            }
            let skip = (pagina - 1) * this.limite

            this.axios.get(`/nota?limit=${this.limite}&skip=${skip}`, config)
                .then(res => {
                    console.log(res.data.notaDB)
                    this.notas = res.data.notaDB
                    this.totalNotas = res.data.totalNotas
                })
                .catch(e => {
                    console.log(e.response)
                })
        },
        agregarNota() {
            const config = {
                headers: {
                    token: this.token
                }
            }
            // console.log(this.nota)
            this.axios.post('/nueva-nota', this.nota, config)
                .then(res => {
                    this.notas.push(res.data)
                    this.nota.nombre = ''
                    this.nota.descripcion = ''
                    this.mensaje.color = 'success'
                    this.mensaje.texto = 'Nota agregada'
                    this.showAlert()
                })
                .catch(e => {
                    console.log(e.response)
                    if (e.response.data.error.errors.nombre.message) {
                        this.mensaje.texto = e.response.data.error.errors.nombre.message
                    } else {
                        this.mesaje.texto = 'Error de sistema'
                    }
                    // this.mensaje.texto = e.response.data.error.errors.nombre.message ? e.response.data.error.errors.nombre.message : 'Error de sistema'
                    this.mensaje.color = 'danger'
                    this.showAlert()
                })
        },
        eliminarNota(id) {
            console.log(id)
            this.axios.delete(`/nota/${id}`)
                .then(res => {
                    const index = this.notas.findIndex(item => item._id === res.data._id)
                    this.notas.splice(index, 1);
                    this.mensaje.color = 'success'
                    this.mensaje.texto = 'Nota eliminada'
                    this.showAlert()
                })
                .catch(e => {
                    console.log(e.response)
                })
        },
        activarEdicion(id) {
            console.log(id)
            this.editar = true
            this.axios.get(`/nota/${id}`)
                .then(res => {
                    this.notaEditar = res.data
                    // this.notaEditar.descripcion = res.data.descripcion
                    // this.notaEditar.nombre = res.data.nombre
                })
                .catch(e => {
                    console.log(e.response)
                })
        },
        editarNota(notaE) {
            console.log(notaE)
            this.axios.put(`/nota/${notaE._id}`, notaE)
                .then(res => {
                    const index = this.notas.findIndex(n => n._id === res.data._id)
                    this.notas[index].nombre = res.data.nombre
                    this.notas[index].descripcion = res.data.descripcion
                    this.mensaje.color = 'success'
                    this.mensaje.texto = 'Nota actualizada'
                    this.showAlert()
                    this.editar = false
                })
                .catch(e => {
                    console.log(e.response)
                })
        },
        countDownChanged(dismissCountDown) {
            this.dismissCountDown = dismissCountDown
        },
        showAlert() {
            this.dismissCountDown = this.dismissSecs
        }
    }
}
</script>