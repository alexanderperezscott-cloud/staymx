// src/components/PublishForm.jsx (o la ruta donde lo tengas)
import React, { useState } from 'react'
import { createListing } from '../../config/supabase'
import { mexicoLocations, tiposOpc, amenidadesOpc } from '../../data/initialData'
import LocationPicker from './LocationPicker' // <-- IMPORTANTE: Importamos el mapa

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">{label}</label>
      {children}
      {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const inputCls = "w-full border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"

export default function PublishForm({ onPublish, onCancel, userId }) {
  const [step, setStep]       = useState(1)
  const [images, setImages]   = useState([])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const [selectedState, setSelectedState] = useState("Campeche")
  const [form, setForm] = useState({
    title:"", type:"Casa", price:"", phone:"", guests:2, beds:1, baths:1,
    description:"", address:"", city:"Campeche", amenities:[],
    latitude: null,  // <-- NUEVO: Para el mapa
    longitude: null  // <-- NUEVO: Para el mapa
  })

  const set = (k,v) => setForm(p => ({...p, [k]: v}))

  const toggleAmenity = (amenity) => {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(amenity)
        ? p.amenities.filter(a => a !== amenity)
        : [...p.amenities, amenity]
    }))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { 
      setImages(prev => [...prev, ev.target.result])
    }
    reader.readAsDataURL(file)
  }

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return
    setImages(prev => [...prev, imageUrlInput.trim()])
    setImageUrlInput('')
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const validateStep = () => {
    const e = {}
    if (step===1 && (!form.title.trim() || !form.price || +form.price <= 0 || form.phone.length !== 10)) {
        e.title = "Completa todos los campos correctamente. El teléfono debe tener 10 dígitos."
    }
    // Añadimos validación para asegurar que marquen el mapa
    if (step===2 && (!form.address.trim() || !form.latitude || !form.longitude)) {
        e.address = "Ingresa la dirección exacta y mueve el pin rojo en el mapa para marcar la ubicación."
    }
    if (step===3 && (images.length === 0 || !form.description.trim())) {
        e.img = "Agrega al menos una foto y descripción"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)

    const newListingData = {
      host_id: userId, // <-- Vital para que no de error la política RLS de Supabase
      title: form.title, 
      type: form.type, 
      price: +form.price, 
      phone: form.phone,
      guests: +form.guests,
      beds: +form.beds, 
      baths: +form.baths, 
      address: form.address, 
      city: form.city,
      state: selectedState, 
      latitude: form.latitude,   // <-- Guardamos latitud real
      longitude: form.longitude, // <-- Guardamos longitud real
      description: form.description, 
      amenities: form.amenities, 
      img: images[0],
      images: images
    }

    const { data, error } = await createListing(newListingData)
    setLoading(false)

    if (error) {
      alert("Error al publicar: " + error.message)
      return
    }

    if (data && data.length > 0) {
      alert("¡Tu alojamiento se ha publicado con éxito en StayMX!")
      onPublish(data[0])
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-gray-900 dark:text-gray-50">
      <button onClick={onCancel} className="text-sm font-semibold text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">← Cancelar y salir</button>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black">Registra tu espacio en StayMX</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Conviértete en Anfitrión y comparte tu propiedad con huéspedes de todo México.</p>
        </div>
        <span className="text-xs font-bold bg-rose-100 text-rose-600 px-3 py-1 rounded-full">Paso {step} de 3</span>
      </div>

      {/* ---------------- PASO 1 ---------------- */}
      {step===1 && (
        <div className="flex flex-col gap-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">1. Datos principales del alojamiento</h2>
          
          <Field label="Título de tu publicación *" error={errors.title}>
            <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Ej. Hermoso Loft Colonial en el Centro" className={inputCls}/>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de Propiedad">
              <select value={form.type} onChange={e=>set("type",e.target.value)} className={inputCls}>
                {tiposOpc.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="Precio por noche (MXN) *">
              <input type="number" min="100" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="Ej. 1200" className={inputCls}/>
            </Field>
          </div>

          {/* TELEFONO CON VALIDACIÓN ESTRICTA */}
          <Field label="Teléfono de contacto del anfitrión *">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">+52</span>
              <input 
                type="tel" 
                maxLength="10"
                pattern="[0-9]{10}"
                value={form.phone} 
                onChange={e => {
                  // Filtra para que el usuario SOLO pueda escribir números
                  const soloNumeros = e.target.value.replace(/[^0-9]/g, '');
                  set("phone", soloNumeros);
                }} 
                onInvalid={e => e.target.setCustomValidity('Ingresa un número válido de 10 dígitos')}
                onInput={e => e.target.setCustomValidity('')}
                placeholder="Ej. 9811234567" 
                className={`${inputCls} pl-10`} // Añadimos padding left para el +52
              />
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
            <Field label="Capacidad (Huéspedes)">
              <input type="number" min="1" max="20" value={form.guests} onChange={e=>set("guests",+e.target.value)} className={inputCls}/>
            </Field>

            <Field label="Camas">
              <input type="number" min="1" max="10" value={form.beds} onChange={e=>set("beds",+e.target.value)} className={inputCls}/>
            </Field>

            <Field label="Baños">
              <input type="number" min="1" max="10" value={form.baths} onChange={e=>set("baths",+e.target.value)} className={inputCls}/>
            </Field>
          </div>
        </div>
      )}

      {/* ---------------- PASO 2 ---------------- */}
      {step===2 && (
        <div className="flex flex-col gap-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">2. Ubicación y Amenidades</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Estado de la República">
              <select 
                value={selectedState} 
                onChange={e => {
                  setSelectedState(e.target.value)
                  // Autoselecciona la primera ciudad de la lista de ese estado
                  set("city", mexicoLocations[e.target.value][0]) 
                }} 
                className={inputCls}
              >
                {Object.keys(mexicoLocations).map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </Field>

            <Field label="Ciudad / Municipio">
              <select value={form.city} onChange={e=>set("city",e.target.value)} className={inputCls}>
                {mexicoLocations[selectedState].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Dirección exacta *" error={errors.address}>
            <input value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Ej. Calle 12 #45 por 59 y 61, Col. Centro" className={inputCls}/>
          </Field>

          {/* EL MAPA DE MAPBOX */}
          <LocationPicker formData={form} setFormData={setForm} />

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">¿Qué servicios ofrece tu alojamiento?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {amenidadesOpc.map(a => {
                const checked = form.amenities.includes(a)
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      checked ? "bg-rose-50 border-rose-500 text-rose-600 dark:bg-rose-950/40" : "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800 text-gray-600"
                    }`}
                  >
                    {a} {checked && "✓"}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- PASO 3 ---------------- */}
      {step===3 && (
        <div className="flex flex-col gap-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">3. Galería de Fotos y Descripción</h2>

          <Field label="Agregar fotos del alojamiento *" error={errors.img}>
            <div className="flex gap-2 mb-3">
              <input 
                type="url" 
                placeholder="Pegar URL de la imagen (Ej. https://...)" 
                value={imageUrlInput}
                onChange={e => setImageUrlInput(e.target.value)}
                className={inputCls}
              />
              <button 
                type="button" 
                onClick={handleAddImageUrl}
                className="px-4 py-2.5 bg-gray-800 text-white rounded-xl text-xs font-bold hover:bg-gray-700 shrink-0"
              >
                + Añadir URL
              </button>
            </div>

            <div className="relative">
              <input type="file" accept="image/*" onChange={handleFileUpload} className={inputCls}/>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {images.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden h-28 border border-gray-200 dark:border-gray-800">
                    <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover"/>
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <Field label="Descripción detallada *">
            <textarea 
              value={form.description} 
              onChange={e=>set("description",e.target.value)} 
              rows={4} 
              placeholder="Describe lo que hace especial a tu propiedad, zonas cercanas, ambiente, etc." 
              className={inputCls}
            />
          </Field>
        </div>
      )}

      {/* ---------------- BOTONES DE NAVEGACIÓN ---------------- */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button onClick={() => setStep(s => s - 1)} className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold">
            Anterior
          </button>
        ) : <div/>}

        {step < 3 ? (
          <button onClick={() => { if (validateStep()) setStep(s => s + 1) }} className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors">
            Siguiente
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-400 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors">
            {loading ? "Publicando..." : "Publicar propiedad 🏡"}
          </button>
        )}
      </div>
    </div>
  )
}