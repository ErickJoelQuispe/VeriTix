import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import UsersSettingsShell from '~/components/users/SettingsShell.vue'

describe('users settings shell', () => {
  it('renderiza contenido base y CTA opcional', async () => {
    const wrapper = await mountSuspended(UsersSettingsShell, {
      props: {
        title: 'Perfil',
        description: 'Administra tu cuenta',
        actionTo: '/users/me',
        actionLabel: 'Volver',
      },
      slots: {
        default: '<div data-test="body">Contenido</div>',
      },
    })

    expect(wrapper.text()).toContain('Perfil')
    expect(wrapper.text()).toContain('Administra tu cuenta')
    expect(wrapper.text()).toContain('Volver')
    expect(wrapper.find('[data-test="body"]').exists()).toBe(true)
  })

  it('aplica el tono minimal en el contenedor', async () => {
    const wrapper = await mountSuspended(UsersSettingsShell, {
      props: {
        title: 'Cerrando sesion',
        description: 'Saliendo de VeriTix',
        tone: 'minimal',
      },
    })

    expect(wrapper.find('section').classes()).toContain('py-10')
  })
})
