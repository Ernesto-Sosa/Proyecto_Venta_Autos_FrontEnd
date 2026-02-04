import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RolTable from '../components/RolTable.vue'

describe('RolTable.vue', () => {
  const roles = [
    { rol_id: 1, nombre_rol: 'Admin', descripcion: 'Control total' },
    { rol_id: 2, nombre_rol: 'Vendedor', descripcion: 'Gestiona ventas' },
  ]

  it('muestra mensaje vacío cuando no hay roles', () => {
    const wrapper = mount(RolTable, { props: { roles: [] } })
    expect(wrapper.text()).toContain('No hay roles disponibles')
  })

  it('renderiza filas con roles', () => {
    const wrapper = mount(RolTable, { props: { roles } })
    const rows = wrapper.findAll('tbody tr')
    // 2 filas (no cuenta la fila vacía) => v-for
    expect(rows.length).toBe(2)
    expect(wrapper.text()).toContain('Admin')
    expect(wrapper.text()).toContain('Vendedor')
  })

  it('emite evento edit al hacer click en Editar', async () => {
    const wrapper = mount(RolTable, { props: { roles } })
    const firstRow = wrapper.findAll('tbody tr')[0]
    const editButton = firstRow.findAll('button')[0]
    await editButton.trigger('click')
    const emitted = wrapper.emitted('edit')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toMatchObject(roles[0])
  })

  it('emite evento delete al hacer click en Eliminar', async () => {
    const wrapper = mount(RolTable, { props: { roles } })
    const secondRow = wrapper.findAll('tbody tr')[1]
    const delButton = secondRow.findAll('button')[1]
    await delButton.trigger('click')
    const emitted = wrapper.emitted('delete')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toBe(roles[1].rol_id)
  })
})
