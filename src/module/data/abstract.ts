import { DocumentSystemFlags } from "@module/documents/system-flags.ts"
import fields = foundry.data.fields
import { SYSTEM_NAME } from "./constants.ts"

interface SystemDataModelMetadata {
	systemFlagsModel: ConstructorOf<DocumentSystemFlags> | null
}

// Type to get the instance type of a class constructor
type InstanceTypeOf<T> = T extends new (...args: any[]) => infer R ? R : never

// Type to combine instance types of all classes in the array
type CombinedInstanceType<T extends any[]> = T extends [infer U, ...infer Rest]
	? U extends new (...args: any[]) => any
		? InstanceTypeOf<U> & CombinedInstanceType<Rest>
		: never
	: {}

// Type to combine static types of all classes in the array
type CombinedStaticType<T extends any[]> = T extends [infer U, ...infer Rest] ? U & CombinedStaticType<Rest> : {}

// Type to represent the combined class with both static and instance members
type CombinedClass<T extends any[]> = CombinedStaticType<T> & (new (...args: any[]) => CombinedInstanceType<T>)

// class SystemDataModel extends foundry.abstract.TypeDataModel<foundry.abstract.Document, fields.DataSchema> {
class SystemDataModel<
	TDocument extends foundry.abstract.Document = foundry.abstract.Document,
	TSchema extends fields.DataSchema = fields.DataSchema,
> extends foundry.abstract.TypeDataModel<TDocument, TSchema> {
	/** @inheritdoc */
	static _enableV10Validation = true

	/**
	 * System type that this system data model represents (e.g. "character", "npc", "vehicle").
	 */
	// static _systemType: string

	/* -------------------------------------------- */

	/**
	 * Base templates used for construction.
	 * @private
	 */
	static _schemaTemplates: (typeof SystemDataModel)[] = []

	/* -------------------------------------------- */

	/**
	 * The field names of the base templates used for construction.
	 * @private
	 */
	static get _schemaTemplateFields(): Set<String> {
		const fieldNames = Object.freeze(new Set(this._schemaTemplates.map(t => t.schema.keys()).flat()))
		Object.defineProperty(this, "_schemaTemplateFields", {
			value: fieldNames,
			writable: false,
			configurable: false,
		})
		return fieldNames
	}

	/* -------------------------------------------- */

	/**
	 * A list of properties that should not be mixed-in to the final type.
	 * @private
	 */
	static _immiscible: Set<string> = new Set([
		"length",
		"mixed",
		"name",
		"prototype",
		"cleanData",
		"_cleanData",
		"_initializationOrder",
		"validateJoint",
		"_validateJoint",
		"migrateData",
		"_migrateData",
		"shimData",
		"_shimData",
		"defineSchema",
	])

	/* -------------------------------------------- */

	/**
	 * Metadata that describes this DataModel.
	 */
	static metadata: SystemDataModelMetadata = Object.freeze({
		systemFlagsModel: null,
	})

	get metadata(): SystemDataModelMetadata {
		return this.constructor.metadata
	}

	/* -------------------------------------------- */

	static override defineSchema(): fields.DataSchema {
		const schema = {}
		for (const template of this._schemaTemplates) {
			if (!template.defineSchema) {
				throw new Error(
					`Invalid ${SYSTEM_NAME} template mixin ${template} defined on class ${this.constructor}`,
				)
			}
			this.mergeSchema(schema, template.defineSchema())
		}
		return schema
	}

	/* -------------------------------------------- */

	/**
	 * Merge two schema definitions together as well as possible.
	 * @param {DataSchema} a  First schema that forms the basis for the merge. *Will be mutated.*
	 * @param {DataSchema} b  Second schema that will be merged in, overwriting any non-mergeable properties.
	 * @returns {DataSchema}  Fully merged schema.
	 */
	static mergeSchema<A extends fields.DataSchema, B extends fields.DataSchema>(a: A, b: B): A & B {
		Object.assign(a, b)
		return a as A & B
	}

	/* -------------------------------------------- */
	/*  Data Cleaning                               */
	/* -------------------------------------------- */

	static override cleanData(source?: object, options?: Record<string, unknown>): SourceFromSchema<fields.DataSchema> {
		this._cleanData(source, options)
		return super.cleanData(source, options)
	}

	/* -------------------------------------------- */

	/**
	 * Performs cleaning without calling DataModel.cleanData.
	 * @param {object} [source]         The source data
	 * @param {object} [options={}]     Additional options (see DataModel.cleanData)
	 */
	static _cleanData(source?: object, options?: Record<string, unknown>) {
		for (const template of this._schemaTemplates) {
			template._cleanData(source, options)
		}
	}

	/* -------------------------------------------- */
	/*  Data Initialization                         */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static override *_initializationOrder(): Generator<[string, fields.DataField], void> {
		for (const template of this._schemaTemplates) {
			for (const entry of template._initializationOrder()) {
				entry[1] = this.schema.get(entry[0])!
				yield entry
			}
		}
		for (const entry of this.schema.entries()) {
			if (this._schemaTemplateFields.has(entry[0])) continue
			yield entry
		}
	}

	/* -------------------------------------------- */
	/*  Socket Event Handlers                       */
	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for this system data.
	 * @param _data               The initial data object provided to the document creation request.
	 * @param _options            Additional options which modify the creation request.
	 * @param _user               The User requesting the document creation.
	 * @returns {Promise<boolean|void>}   A return value of false indicates the creation operation should be cancelled.
	 */
	override async _preCreate(
		_data: this["_source"],
		_options: DatabaseCreateOperation<TDocument["parent"]>,
		_user: User,
	): Promise<boolean | void> {}

	/**
	 * Pre-update logic for this system data.
	 * @param _data               The initial data object provided to the document creation request.
	 * @param _options            Additional options which modify the creation request.
	 * @param _user               The User requesting the document creation.
	 * @returns {Promise<boolean|void>}   A return value of false indicates the creation operation should be cancelled.
	 */
	async _preUpdate(
		_data: this["_source"],
		_options: DatabaseUpdateOperation<TDocument["parent"]>,
		_user: foundry.documents.BaseUser,
	): Promise<boolean | void> {}

	/**
	 * Pre-delete logic for this system data.
	 * @param _options Additional options which modify the creation request.
	 * @param _user    The User requesting the document creation.
	 * @returns        A return value of false indicates the creation operation should be cancelled.
	 */
	async _preDelete(
		_options: DatabaseDeleteOperation<TDocument["parent"]>,
		_user: foundry.documents.BaseUser,
	): Promise<boolean | void> {}

	_onCreate(
		_data: Partial<this["_source"]>,
		_options: DatabaseCreateOperation<TDocument["parent"]>,
		_userId: string,
	) {}

	/* -------------------------------------------- */

	_onUpdate(
		_changed: Partial<this["_source"]>,
		_options: DatabaseUpdateOperation<TDocument["parent"]>,
		_userId: string,
	) {}

	/* -------------------------------------------- */

	_onDelete(_options: DatabaseDeleteOperation<TDocument["parent"]>, _userId: string) {}

	/* -------------------------------------------- */
	/*  Data Validation                             */
	/* -------------------------------------------- */

	override validate(options = {}) {
		if (this.constructor._enableV10Validation === false) return true
		return super.validate(options)
	}

	/* -------------------------------------------- */
	/*  Data Validation                             */
	/* -------------------------------------------- */

	static override validateJoint(data: SourceFromSchema<fields.DataSchema>) {
		this._validateJoint(data)
		return super.validateJoint(data)
	}

	/* -------------------------------------------- */

	/**
	 * Performs joint validation without calling DataModel.validateJoint.
	 * @param  data The source data
	 * @throws      An error if a validation failure is detected
	 */
	protected static _validateJoint(data: SourceFromSchema<fields.DataSchema>) {
		for (const template of this._schemaTemplates) {
			template._validateJoint(data)
		}
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static override migrateData(source: SourceFromSchema<fields.DataSchema>) {
		this._migrateData(source)
		return super.migrateData(source)
	}

	/* -------------------------------------------- */

	/**
	 * Performs migration without calling DataModel.migrateData.
	 */
	static _migrateData(source: SourceFromSchema<fields.DataSchema>) {
		for (const template of this._schemaTemplates) {
			template._migrateData(source)
		}
	}

	/* -------------------------------------------- */

	static override shimData(data: object, options?: { embedded?: boolean }): object {
		this._shimData(data, options)
		return super.shimData(data, options)
	}

	/* -------------------------------------------- */

	/**
	 * Performs shimming without calling DataModel.shimData.
	 * @param {object} data         The source data
	 * @param {object} [options]    Additional options (see DataModel.shimData)
	 * @protected
	 */
	static _shimData(data: object, options?: { embedded?: boolean }): void {
		for (const template of this._schemaTemplates) {
			template._shimData(data, options)
		}
	}

	/* -------------------------------------------- */
	/*  Mixins                                      */
	/* -------------------------------------------- */

	/**
	 * Mix multiple templates with the base type.
	 */
	static mixin<T extends (typeof SystemDataModel<any, any>)[]>(...templates: T): CombinedClass<T> {
		for (const template of templates) {
			if (!(template.prototype instanceof SystemDataModel)) {
				throw new Error(`${template.name} is not a subclass of SystemDataModel`)
			}
		}

		const Base = class extends this {}
		Object.defineProperty(Base, "_schemaTemplates", {
			value: Object.seal([...this._schemaTemplates, ...templates]),
			writable: false,
			configurable: false,
		})

		for (const template of templates) {
			// Take all static methods and fields from template and mix in to base class
			for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(template))) {
				if (this._immiscible.has(key)) continue
				Object.defineProperty(Base, key, descriptor)
			}

			// Take all instance methods and fields from template and mix in to base class
			for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(template.prototype))) {
				if (["constructor"].includes(key)) continue
				Object.defineProperty(Base.prototype, key, descriptor)
			}
		}

		return Base as unknown as CombinedClass<T>
	}
}

interface SystemDataModel<TDocument extends foundry.abstract.Document, TSchema extends fields.DataSchema>
	extends foundry.abstract.TypeDataModel<TDocument, TSchema> {
	constructor: typeof SystemDataModel<TDocument, TSchema>
}

export { SystemDataModel, type SystemDataModelMetadata }
