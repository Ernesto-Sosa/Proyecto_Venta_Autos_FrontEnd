import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RolForm from '../components/RolForm.vue'
import { nextTick } from 'vue'

const STORAGE_KEY = 'rolFormData'

describe('RolForm.vue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza datos iniciales', async () => {
    const wrapper = mount(RolForm, {
      props: { initialData: { nombre_rol: 'Admin', descripcion: 'Control total' } },
    })

    await nextTick()

    const nombre = wrapper.find('input[type="text"]')
    const descripcion = wrapper.find('textarea')

    expect((nombre.element as HTMLInputElement).value).toBe('Admin')
    expect((descripcion.element as HTMLTextAreaElement).value).toBe('Control total')
  })

  it('guarda en localStorage cuando cambian los datos', async () => {
    const wrapper = mount(RolForm)
    const nombre = wrapper.find('input[type="text"]')

    await nombre.setValue('Supervisor')
    await nextTick()
    await nextTick()

    const saved = localStorage.getItem(STORAGE_KEY)
    expect(saved).toBeTruthy()
    const parsed = JSON.parse(saved!)
    expect(parsed.nombre_rol).toBe('Supervisor')
  })

  it('muestra error cuando faltan campos y no emite submit', async () => {
    const wrapper = mount(RolForm, { props: { initialData: { nombre_rol: '', descripcion: '' } } })

    ;(wrapper.vm as any).submit()
    await nextTick()

    expect(wrapper.text()).toContain('Todos los campos son requeridos')
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('emite submit con datos válidos y limpia localStorage', async () => {
    const wrapper = mount(RolForm)

    await wrapper.find('input[type="text"]').setValue('Vendedor')
    await wrapper.find('textarea').setValue('Gestiona ventas')
    await nextTick()
    await nextTick()

    ;(wrapper.vm as any).submit()
    await nextTick()

    const emits = wrapper.emitted('submit')
    expect(emits).toBeTruthy()
    expect(emits![0][0]).toMatchObject({ nombre_rol: 'Vendedor', descripcion: 'Gestiona ventas' })

    const saved = localStorage.getItem(STORAGE_KEY)
    expect(saved).toBeNull()
  })
})
