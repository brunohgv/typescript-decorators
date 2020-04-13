import APIServer from "./APIServer"
import { Request, Response, Router } from 'express'

const server = new APIServer()

class APIRoutes {

    @route('get', '/')
    @logRoute()
    public indexRoute(req: Request, res: Response) {
        return {
            Hello: 'World'
        }
    }

    @route('get', '/people')
    @logRoute()
    @authenticate('123456')
    public peopleRoute(req: Request, res: Response) {
        return {
            people: [
                {
                    name: 'Bruno Vasconcelos'
                },
                {
                    name: 'Adriana Carvalho'
                }
            ]
        }
    }

}

function route(method: string, path: string) : MethodDecorator {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        server.app[method](path, (req: Request, res: Response) => {
            return res.status(200).json(descriptor.value(req, res))
        })
    }
}

function logRoute() : MethodDecorator {
    return function (target: Object, propertyKeys: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value
        descriptor.value = function(...args: any[]) {
            let req = args[0] as Request
            console.log(`${req.method} ${req.url}`)
            return original.apply(this, args)
        }
    }
}

function authenticate(key: string) : MethodDecorator {
    return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value
        descriptor.value = function (...args: any[]) {
            const req = args[0] as Request
            const res = args[1] as Response
            const headers = req.headers
            if (headers.hasOwnProperty('apikey') && headers.apikey === key) {
                return original.apply(this.args)
            }
            return res.status(401).json({ error: 'Unauthorized' })
        }
    }
}
server.start()