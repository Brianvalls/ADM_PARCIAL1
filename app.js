

const { createApp } = Vue;


const RecipeCard = {
    props: {
        receta: {
            type: Object,
            required: true
        }
    },
    template: `
        <div class="recipe-card" :class="{ 'favorita': receta.esFavorita }">
            <div class="card-header">
                <h3>{{ receta.nombre }}</h3>
                <div class="card-badges">
                    <span class="badge tipo" :class="receta.tipo">{{ formatearTipo(receta.tipo) }}</span>
                    <span class="badge dificultad" :class="receta.dificultad">{{ formatearDificultad(receta.dificultad) }}</span>
                    <span v-if="receta.esFavorita" class="badge favorita">Favorita</span>
                </div>
            </div>
            
            <div class="card-image">
                <img :src="obtenerImagen(receta.tipo)" :alt="receta.nombre" />
            </div>
            
            <div class="card-content">
                <p class="descripcion">{{ receta.descripcion }}</p>
                
                <div class="recipe-info">
                    <div class="info-item">
                        <span class="icon">Tiempo:</span>
                        <span>{{ receta.tiempo }} min</span>
                    </div>
                    <div class="info-item">
                        <span class="icon">Tipo:</span>
                        <span>{{ receta.tipo }}</span>
                    </div>
                    <div class="info-item">
                        <span class="icon">Creada:</span>
                        <span>{{ formatearFecha(receta.fechaCreacion) }}</span>
                    </div>
                </div>
                
                <div class="ingredientes">
                    <h4>Ingredientes:</h4>
                    <ul>
                        <li v-for="ingrediente in receta.ingredientes.split(',')" :key="ingrediente">
                            {{ ingrediente.trim() }}
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="card-actions">
                <like-counter 
                    :receta-id="receta.id"
                    :initial-likes="receta.likes || 0"
                    @like-updated="actualizarLikes"
                ></like-counter>
                
                <div class="action-buttons">
                    <button 
                        @click="$emit('toggle-favorita', receta.id)"
                        class="btn btn-sm"
                        :class="receta.esFavorita ? 'btn-warning' : 'btn-outline'"
                    >
                        {{ receta.esFavorita ? 'Favorita' : 'Marcar Favorita' }}
                    </button>
                    
                    <button 
                        @click="$emit('eliminar', receta.id)"
                        class="btn btn-sm btn-danger"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `,
    methods: {
        
        formatearFecha(iso){
            const d = new Date(iso);
            return d.toLocaleDateString();
        },
        formatearTipo(tipo) {
            const tipos = {
                'ramen': 'Ramen',
                'sushi': 'Sushi',
                'donburi': 'Donburi',
                'tempura': 'Tempura',
                'curry-japones': 'Curry japonés',
                'okonomiyaki': 'Okonomiyaki',
                'yakitori': 'Yakitori',
                'bento': 'Bento',
                'wagashi': 'Wagashi'
            };
            return tipos[tipo] || tipo;
        },
        
        
        formatearDificultad(dificultad) {
            const dificultades = {
                'facil': 'Fácil',
                'media': 'Media',
                'dificil': 'Difícil'
            };
            return dificultades[dificultad] || dificultad;
        },
        
        
        obtenerImagen(tipo) {
            const imagenes = {
                'ramen': 'Imagenes/ramen.jpeg',
                'sushi': 'Imagenes/sushi.jpeg',
                'donburi': 'Imagenes/donburi.jpeg',
                'tempura': 'Imagenes/tempura.jpeg',
                'curry-japones': 'Imagenes/curry-japones.jpeg',
                'okonomiyaki': 'Imagenes/okonomiyaki.jpeg',
                'yakitori': 'Imagenes/yakitori.jpeg',
                'bento': 'Imagenes/bento.jpeg',
                'wagashi': 'Imagenes/wagashi.jpeg'
            };
            return imagenes[tipo] || 'Imagenes/ramen.jpeg';
        },
        
        
        actualizarLikes(recetaId, nuevosLikes) {
            this.$emit('like-updated', recetaId, nuevosLikes);
        }
    }
};


const LikeCounter = {
    props: {
        recetaId: {
            type: Number,
            required: true
        },
        initialLikes: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            likes: this.initialLikes,
            isLiked: false
        };
    },
    template: `
        <div class="like-counter">
            <button 
                @click="toggleLike"
                class="like-btn"
                :class="{ 'liked': isLiked }"
            >
                {{ isLiked ? 'Me gusta' : 'Like' }} {{ likes }}
            </button>
        </div>
    `,
    methods: {
        toggleLike() {
            if (this.isLiked) {
                this.likes--;
            } else {
                this.likes++;
            }
            this.isLiked = !this.isLiked;
            this.$emit('like-updated', this.recetaId, this.likes);
        }
    }
};


const app = createApp({
    data() {
        return {
            
            nuevaReceta: {
                nombre: '',
                descripcion: '',
                tipo: '',
                dificultad: '',
                tiempo: null,
                ingredientes: '',
                esFavorita: false
            },
            
            
            errores: {},
            
            
            recetas: [],
            
            
            siguienteId: 1
        };
    },
    
    mounted() {
        
        this.cargarRecetas();
    },
    
    methods: {
        
        contarFavoritas() { return this.recetas.filter(r => r.esFavorita).length; },
        validarFormulario() {
            this.errores = {};
            let esValido = true;
            
            
            if (!this.nuevaReceta.nombre.trim()) {
                this.errores.nombre = 'El nombre es obligatorio';
                esValido = false;
            }
            
            
            if (!this.nuevaReceta.descripcion.trim()) {
                this.errores.descripcion = 'La descripción es obligatoria';
                esValido = false;
            }
            
            
            if (!this.nuevaReceta.tipo) {
                this.errores.tipo = 'Debes seleccionar un tipo de cocina';
                esValido = false;
            }
            
            
            if (!this.nuevaReceta.dificultad) {
                this.errores.dificultad = 'Debes seleccionar una dificultad';
                esValido = false;
            }
            
            
            if (!this.nuevaReceta.tiempo || this.nuevaReceta.tiempo <= 0) {
                this.errores.tiempo = 'El tiempo debe ser mayor a 0';
                esValido = false;
            }
            
            
            if (!this.nuevaReceta.ingredientes.trim()) {
                this.errores.ingredientes = 'Los ingredientes son obligatorios';
                esValido = false;
            }
            
            return esValido;
        },
        
        
        agregarReceta() {
            if (this.validarFormulario()) {
                const receta = {
                    id: this.siguienteId++,
                    ...this.nuevaReceta,
                    likes: 0,
                    fechaCreacion: new Date().toISOString()
                };
                
                this.recetas.push(receta);
                this.guardarRecetas();
                this.limpiarFormulario();
                
                
                alert('¡Receta agregada exitosamente!');
            }
        },
        
        
        limpiarFormulario() {
            this.nuevaReceta = {
                nombre: '',
                descripcion: '',
                tipo: '',
                dificultad: '',
                tiempo: null,
                ingredientes: '',
                esFavorita: false
            };
            this.errores = {};
        },
        
        
        eliminarReceta(id) {
            if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
                this.recetas = this.recetas.filter(receta => receta.id !== id);
                this.guardarRecetas();
            }
        },
        
        
        toggleFavorita(id) {
            const receta = this.recetas.find(r => r.id === id);
            if (receta) {
                receta.esFavorita = !receta.esFavorita;
                this.guardarRecetas();
            }
        },
        
        
        limpiarTodasLasRecetas() {
            if (confirm('¿Estás seguro de que quieres eliminar TODAS las recetas? Esta acción no se puede deshacer.')) {
                this.recetas = [];
                this.guardarRecetas();
            }
        },
        
        
        guardarRecetas() {
            try {
                localStorage.setItem('recetas_japonesas', JSON.stringify(this.recetas));
                localStorage.setItem('siguienteId', this.siguienteId.toString());
            } catch (error) {
                console.error('Error al guardar en localStorage:', error);
            }
        },
        
        
        cargarRecetas() {
            try {
                const recetasGuardadas = localStorage.getItem('recetas_japonesas');
                const siguienteIdGuardado = localStorage.getItem('siguienteId');
                
                if (recetasGuardadas) {
                    this.recetas = JSON.parse(recetasGuardadas);
                }
                
                if (siguienteIdGuardado) {
                    this.siguienteId = parseInt(siguienteIdGuardado);
                }
                
                
                if (this.recetas.length === 0) {
                    this.agregarRecetasEjemplo();
                }
            } catch (error) {
                console.error('Error al cargar del localStorage:', error);
                this.agregarRecetasEjemplo();
            }
        },
        
        
        agregarRecetasEjemplo() {
            const recetasEjemplo = [
                {
                    id: 1,
                    nombre: 'Tonkotsu Ramen',
                    descripcion: 'Ramen de caldo de huesos de cerdo, rico y cremoso con fideos al dente',
                    tipo: 'ramen',
                    dificultad: 'dificil',
                    tiempo: 240,
                    ingredientes: 'Huesos de cerdo, Kombu, Katsuobushi, Miso, Shoyu, Fideos, Huevo, Cebolla verde',
                    esFavorita: false,
                    likes: 15,
                    fechaCreacion: new Date().toISOString()
                },
                {
                    id: 2,
                    nombre: 'Gyudon',
                    descripcion: 'Bowl de arroz con carne de res cocida en salsa dulce y salada',
                    tipo: 'donburi',
                    dificultad: 'media',
                    tiempo: 30,
                    ingredientes: 'Carne de res, Cebolla, Salsa de soja, Mirin, Sake, Azúcar, Arroz, Huevo',
                    esFavorita: true,
                    likes: 8,
                    fechaCreacion: new Date().toISOString()
                },
                {
                    id: 3,
                    nombre: 'Tempura mixta',
                    descripcion: 'Verduras y mariscos rebozados en masa ligera y fritos hasta dorar',
                    tipo: 'tempura',
                    dificultad: 'media',
                    tiempo: 35,
                    ingredientes: 'Langostinos, Batata, Zapallo kabocha, Harina, Agua helada, Aceite, Daikon',
                    esFavorita: false,
                    likes: 12,
                    fechaCreacion: new Date().toISOString()
                }
            ];
            
            this.recetas = recetasEjemplo;
            this.siguienteId = 4;
            this.guardarRecetas();
        }
    },
    
    components: {
        'recipe-card': RecipeCard,
        'like-counter': LikeCounter
    }
});


app.component('recipe-card', RecipeCard);
app.component('like-counter', LikeCounter);
app.mount('#app');

